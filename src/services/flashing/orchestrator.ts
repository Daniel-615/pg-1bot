import { compileFirmware, type CompileTarget } from "../arduino.compile.service";
import { AVRStk500v1Flasher, AVRStk500v2Flasher } from "./avr";
import { getBoardProfile } from "./boards";
import { ESP32Flasher, type EspImage } from "./esp32";
import { parseIntelHex, validateArtifact } from "./firmware";
import { SerialDeviceManager } from "./serial";
import type { CompileFlashOptions, DetectedDevice, FlashProgress, FlashResult, FlashStage } from "./types";

export class FlashOrchestrator {
  private readonly devices = new SerialDeviceManager();
  private selected: DetectedDevice | null = null;
  private boardId: string | null = null;
  private running = false;
  private cancelled = false;
  private listeners = new Set<(progress: FlashProgress) => void>();
  private readonly target: CompileTarget;
  constructor(target: CompileTarget) { this.target = target; }
  detectAuthorizedDevices(): Promise<DetectedDevice[]> { this.emit("detecting", 0, "Buscando puertos Web Serial autorizados."); return this.devices.detectAuthorizedDevices(); }
  async requestDevice(): Promise<DetectedDevice> { this.emit("requesting-permission", 0, "Selecciona un puerto en el diálogo del navegador."); const device = await this.devices.requestDevice(); this.selected = device; this.emit("detecting", 100, "Puerto autorizado."); return device; }
  async selectBoard(boardId: string): Promise<void> { getBoardProfile(boardId); this.boardId = boardId; this.emit("board-selected", 100, `Placa seleccionada: ${boardId}.`); }
  onProgress(callback: (progress: FlashProgress) => void): () => void { this.listeners.add(callback); return () => this.listeners.delete(callback); }
  async compileAndFlash(code: string, options: CompileFlashOptions = {}): Promise<FlashResult> {
    if (this.running) throw new Error("Ya hay una operación de flasheo en curso.");
    if (!this.selected || !this.boardId) throw new Error("Selecciona y autoriza una placa antes de compilar.");
    if (this.selected.confidence === "unknown") throw new Error("No se pudo identificar el USB; confirma una placa compatible con VID/PID conocido.");
    const profile = getBoardProfile(this.boardId);
    if (this.selected.vendorId !== undefined && !profile.vendorIds.includes(this.selected.vendorId)) throw new Error("El VID del puerto no coincide con la placa seleccionada.");
    this.running = true; this.cancelled = false;
    try {
      this.emit("compiling", 0, "Compilando en el servicio configurado.");
      const compiled = await compileFirmware({ code, board: this.boardId.startsWith("arduino-uno") ? "uno" : this.boardId.startsWith("arduino-nano") ? "nano" : this.boardId.startsWith("arduino-mega") ? "mega" : "esp32", filename: options.filename, target: this.target });
      this.emit("receiving-firmware", 100, `Firmware recibido: ${compiled.fileName}.`);
      const bytes = new Uint8Array(compiled.bytes); let segments: Array<{ address: number; data: Uint8Array }> = [];
      if (profile.artifact === "intel-hex") segments = parseIntelHex(new TextDecoder().decode(bytes));
      else {
        const configured = (options.compileOptions?.flashImages as EspImage[] | undefined);
        if (!configured?.length) throw new Error("ESP32 requiere artefactos con offsets explícitos; no se asumirá 0x10000.");
        segments = configured;
      }
      const expectedFormat = profile.artifact === "intel-hex" ? "intel-hex" : "binary";
      validateArtifact({ format: expectedFormat, segments, bytes: profile.artifact === "binary" ? bytes.buffer : undefined }, expectedFormat, profile.id.includes("mega") ? 253952 : profile.id.includes("uno") || profile.id.includes("nano") ? 32768 : 16 * 1024 * 1024);
      if (options.confirm && !(await options.confirm())) throw new Error("El usuario canceló la confirmación de escritura.");
      this.emit("connecting-bootloader", 0, "Conectando con el bootloader."); await this.devices.open(this.selected, profile.baudRate);
      this.emit("flashing", 0, "Escribiendo firmware.");
      const update = (percentage: number) => this.emit("flashing", percentage, `Escribiendo firmware (${Math.round(percentage)}%).`);
      let bytesWritten: number;
      if (profile.protocol === "stk500v1") bytesWritten = await new AVRStk500v1Flasher(this.devices.port!, profile, () => this.cancelled, update).flash(segments, options.verify !== false);
      else if (profile.protocol === "stk500v2") bytesWritten = await new AVRStk500v2Flasher(this.devices.port!, () => this.cancelled, update).flash(segments, options.verify !== false);
      else if (profile.protocol === "esp32") bytesWritten = await new ESP32Flasher(this.devices.port!, () => this.cancelled, update).flash(segments, options.verify !== false);
      else throw new Error("Esta placa no tiene flasheador Web Serial documentado.");
      this.emit("restarting", 100, "Reiniciando dispositivo."); await this.devices.close(); this.emit("completed", 100, "Firmware grabado y verificado."); return { boardId: this.boardId, verified: options.verify !== false, bytesWritten };
    } catch (error) { this.emit(this.cancelled ? "cancelled" : "error", 0, error instanceof Error ? error.message : "Falló el flasheo."); await this.devices.close(); throw error; }
    finally { this.running = false; }
  }
  async cancel(): Promise<void> { if (this.running) this.cancelled = true; }
  async disconnect(): Promise<void> { if (this.running) await this.cancel(); await this.devices.close(); this.selected = null; this.boardId = null; }
  private emit(stage: FlashStage, percentage: number, message: string): void { const progress = { stage, percentage, message }; this.listeners.forEach((listener) => listener(progress)); }
}
