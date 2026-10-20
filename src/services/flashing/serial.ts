import type { DetectedDevice, SerialPortLike } from "./types";
import { detectBoard } from "./boards";

type SerialNavigator = { serial?: { getPorts(): Promise<SerialPortLike[]>; requestPort(options?: { filters?: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPortLike>; addEventListener?(event: string, listener: EventListener): void } };
const serial = (): SerialNavigator["serial"] => (navigator as unknown as SerialNavigator).serial;
const ARDUINO_USB_FILTERS = [
  { usbVendorId: 0x2341 }, // Arduino
  { usbVendorId: 0x1a86 }, // CH340/CH341
  { usbVendorId: 0x10c4 }, // CP210x
  { usbVendorId: 0x0403 }, // FTDI
  { usbVendorId: 0x303a }, // Espressif
  { usbVendorId: 0x2e8a }, // Raspberry Pi Pico
];

export class SerialDeviceManager {
  private current: SerialPortLike | null = null;
  async detectAuthorizedDevices(): Promise<DetectedDevice[]> {
    const api = serial();
    if (!api) throw new Error("Este navegador no soporta Web Serial API.");
    return Promise.all((await api.getPorts()).map(async (port) => this.describe(port)));
  }
  async requestDevice(): Promise<DetectedDevice> {
    const api = serial();
    if (!api) throw new Error("Este navegador no soporta Web Serial API.");
    const port = await api.requestPort({ filters: ARDUINO_USB_FILTERS });
    return this.describe(port);
  }
  private describe(port: SerialPortLike): DetectedDevice {
    const info = port.getInfo();
    return { port, vendorId: info.usbVendorId, productId: info.usbProductId, confidence: detectBoard({ vendorId: info.usbVendorId, productId: info.usbProductId }) };
  }
  async open(device: DetectedDevice, baudRate: number): Promise<void> {
    if (this.current && this.current !== device.port) throw new Error("Ya existe otro puerto abierto por el flasheador.");
    this.current = device.port;
    await device.port.open({ baudRate });
  }
  async close(): Promise<void> { if (this.current) { await this.current.close().catch(() => undefined); this.current = null; } }
  get port(): SerialPortLike | null { return this.current; }
}
