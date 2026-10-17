import type { BoardProfile } from "./boards";
import type { SerialPortLike } from "./types";

const EOP = 0x20;
const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

class SerialByteChannel {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private readonly writer: WritableStreamDefaultWriter<Uint8Array>;
  private pending = new Uint8Array();
  constructor(port: SerialPortLike) {
    if (!port.readable || !port.writable) throw new Error("El puerto no expone streams Web Serial.");
    this.writer = port.writable.getWriter();
    this.reader = port.readable.getReader();
  }
  async write(bytes: Uint8Array): Promise<void> { await this.writer.write(bytes); }
  async read(length: number, timeoutMs = 1500): Promise<Uint8Array> {
    const deadline = Date.now() + timeoutMs;
    while (this.pending.length < length) {
      if (Date.now() >= deadline) throw new Error("Timeout esperando respuesta del bootloader.");
      const result = await Promise.race([this.reader!.read(), sleep(Math.max(1, deadline - Date.now())).then(() => ({ done: true, value: undefined }))]);
      if (result.done || !result.value) throw new Error("Bootloader desconectado o sin respuesta.");
      const merged = new Uint8Array(this.pending.length + result.value.length);
      merged.set(this.pending); merged.set(result.value, this.pending.length); this.pending = merged;
    }
    const result = this.pending.slice(0, length); this.pending = this.pending.slice(length); return result;
  }
  async close(): Promise<void> { await this.reader?.cancel().catch(() => undefined); this.reader?.releaseLock(); this.writer.releaseLock(); }
}

export class AVRStk500v1Flasher {
  private readonly port: SerialPortLike;
  private readonly profile: BoardProfile;
  private readonly cancelled: () => boolean;
  private readonly progress: (value: number) => void;
  constructor(port: SerialPortLike, profile: BoardProfile, cancelled: () => boolean, progress: (value: number) => void) { this.port = port; this.profile = profile; this.cancelled = cancelled; this.progress = progress; }
  private async command(channel: SerialByteChannel, bytes: number[], response = 1): Promise<Uint8Array> {
    await channel.write(Uint8Array.from([...bytes, EOP]));
    const result = await channel.read(response);
    if (result[0] !== 0x14) throw new Error(`STK500v1 rechazó el comando (0x${result[0].toString(16)}).`);
    return result;
  }
  async flash(segments: Array<{ address: number; data: Uint8Array }>, verify = true): Promise<number> {
    const channel = new SerialByteChannel(this.port);
    try {
      await this.port.setSignals?.({ dataTerminalReady: false, requestToSend: false }); await sleep(60);
      for (let attempt = 0; attempt < 3; attempt += 1) { try { await this.command(channel, [0x30]); break; } catch (error) { if (attempt === 2) throw error; await sleep(100); } }
      await this.command(channel, [0x50]);
      const total = segments.reduce((sum, segment) => sum + segment.data.length, 0); let written = 0;
      for (const segment of segments) {
        if (segment.address % 2) throw new Error("Dirección AVR no alineada a palabra.");
        for (let offset = 0; offset < segment.data.length; offset += this.profile.pageSize) {
          if (this.cancelled()) throw new Error("Operación cancelada.");
          const data = segment.data.slice(offset, offset + this.profile.pageSize); const word = (segment.address + offset) >>> 1;
          await this.command(channel, [0x55, word & 0xff, word >>> 8]);
          await this.command(channel, [0x64, (data.length >>> 8) & 0xff, data.length & 0xff, 0x46, ...data]);
          if (verify) {
            await this.command(channel, [0x55, word & 0xff, word >>> 8]);
            const read = await this.command(channel, [0x74, (data.length >>> 8) & 0xff, data.length & 0xff, 0x46], data.length + 1);
            if (!read.slice(1).every((byte, index) => byte === data[index])) throw new Error("Verificación AVR fallida.");
          }
          written += data.length; this.progress(written / total * 100);
        }
      }
      await this.command(channel, [0x51]);
      return written;
    } finally { await channel.close(); }
  }
}

export class AVRStk500v2Flasher {
  private readonly port: SerialPortLike;
  private readonly cancelled: () => boolean;
  private readonly progress: (value: number) => void;
  constructor(port: SerialPortLike, cancelled: () => boolean, progress: (value: number) => void) { this.port = port; this.cancelled = cancelled; this.progress = progress; }
  private async packet(channel: SerialByteChannel, body: number[]): Promise<Uint8Array> {
    const packet = [0x1b, 0, (body.length >>> 8) & 0xff, body.length & 0xff, 0x0e, ...body];
    packet.push(packet.slice(1).reduce((sum, byte) => sum ^ byte, 0)); await channel.write(Uint8Array.from(packet));
    const header = await channel.read(5); const length = header[2] * 256 + header[3]; const response = await channel.read(length + 1);
    if (response[0] !== 0x00) throw new Error(`STK500v2 rechazó el comando (0x${response[0].toString(16)}).`);
    return response;
  }
  async flash(segments: Array<{ address: number; data: Uint8Array }>, verify = true): Promise<number> {
    const channel = new SerialByteChannel(this.port); let written = 0; const total = segments.reduce((sum, segment) => sum + segment.data.length, 0);
    try {
      await this.packet(channel, [0x01]);
      for (const segment of segments) for (let offset = 0; offset < segment.data.length; offset += 256) {
        if (this.cancelled()) throw new Error("Operación cancelada.");
        const data = segment.data.slice(offset, offset + 256); const address = segment.address + offset;
        await this.packet(channel, [0x06, (address >>> 1) & 0xff, (address >>> 9) & 0xff, (address >>> 17) & 0xff, (address >>> 25) & 0xff]);
        await this.packet(channel, [0x13, (data.length >>> 8) & 0xff, data.length & 0xff, 0xc1, 0x0a, 0x00, 0x20, ...data]);
        if (verify) { const read = await this.packet(channel, [0x14, (data.length >>> 8) & 0xff, data.length & 0xff, 0x20]); if (!read.slice(1).every((byte, index) => byte === data[index])) throw new Error("Verificación Mega 2560 fallida."); }
        written += data.length; this.progress(written / total * 100);
      }
      await this.packet(channel, [0x11, 0x01]); return written;
    } finally { await channel.close(); }
  }
}
