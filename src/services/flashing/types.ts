export type FlashStage = "idle" | "requesting-permission" | "detecting" | "board-selected" | "compiling" | "receiving-firmware" | "validating-firmware" | "connecting-bootloader" | "flashing" | "verifying" | "restarting" | "completed" | "error" | "cancelled";

export interface SerialPortLike {
  open(options: { baudRate: number; dataBits?: 7 | 8; stopBits?: 1 | 2; parity?: "none" | "even" | "odd" }): Promise<void>;
  close(): Promise<void>;
  getInfo(): { usbVendorId?: number; usbProductId?: number };
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  setSignals?(signals: { dataTerminalReady?: boolean; requestToSend?: boolean }): Promise<void>;
}

export interface DetectedDevice {
  port: SerialPortLike;
  vendorId?: number;
  productId?: number;
  boardId?: string;
  confidence: "high" | "medium" | "ambiguous" | "unknown";
}

export interface FlashProgress { stage: FlashStage; percentage: number; message: string }
export interface CompileFlashOptions { filename?: string; compileOptions?: Record<string, unknown>; confirm?: () => Promise<boolean> | boolean; verify?: boolean }
export interface FlashResult { boardId: string; verified: boolean; bytesWritten: number }
export interface Artifact { format: string; bytes?: ArrayBuffer; segments?: Array<{ address: number; data: Uint8Array }> }
