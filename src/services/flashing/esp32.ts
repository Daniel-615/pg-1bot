import { ESPLoader, Transport } from "esptool-js";
import type { SerialPortLike } from "./types";

export interface EspImage { address: number; data: Uint8Array }
export class ESP32Flasher {
  private readonly port: SerialPortLike;
  private readonly cancelled: () => boolean;
  private readonly progress: (value: number) => void;
  constructor(port: SerialPortLike, cancelled: () => boolean, progress: (value: number) => void) { this.port = port; this.cancelled = cancelled; this.progress = progress; }
  async flash(images: EspImage[], verify = true): Promise<number> {
    if (!images.length || images.some((image) => image.address < 0 || !image.data.length)) throw new Error("ESP32 requiere segmentos binarios con direcciones válidas.");
    if (this.cancelled()) throw new Error("Operación cancelada.");
    const transport = new Transport(this.port as never, false);
    const loader = new ESPLoader({ transport, baudrate: 115200, terminal: { clean: () => undefined, writeLine: () => undefined, write: () => undefined } });
    await loader.main("default_reset");
    let bytes = 0; const total = images.reduce((sum, image) => sum + image.data.length, 0);
    await loader.writeFlash({ fileArray: images.map((image) => ({ data: image.data, address: image.address })), flashSize: "detect", flashMode: "keep", flashFreq: "keep", eraseAll: false, compress: true, reportProgress: (_file, written, _size) => { bytes += written; this.progress(Math.min(100, (bytes / total) * 100)); if (this.cancelled()) throw new Error("Operación cancelada."); } });
    if (verify) for (const image of images) { const read = await loader.readFlash(image.address, image.data.length); if (!read.every((value, index) => value === image.data[index])) throw new Error("Verificación ESP32 fallida."); }
    await loader.after("hard_reset"); return total;
  }
}
