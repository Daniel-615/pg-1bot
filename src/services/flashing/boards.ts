import type { DetectedDevice } from "./types";

export type BoardProtocol = "stk500v1" | "stk500v2" | "esp32" | "unsupported";
export interface BoardProfile { id: string; fqbn?: string; protocol: BoardProtocol; baudRate: number; pageSize: number; vendorIds: number[]; productIds?: number[]; artifact: "intel-hex" | "binary" | "codey"; }

export const BOARD_REGISTRY: BoardProfile[] = [
  { id: "arduino-uno-r3", fqbn: "arduino:avr:uno", protocol: "stk500v1", baudRate: 115200, pageSize: 128, vendorIds: [0x2341, 0x2a03], productIds: [0x0043, 0x0001], artifact: "intel-hex" },
  { id: "arduino-nano-classic-optiboot", fqbn: "arduino:avr:nano", protocol: "stk500v1", baudRate: 115200, pageSize: 128, vendorIds: [0x2341, 0x0403, 0x1a86], productIds: [0x0043, 0x7523, 0x6015], artifact: "intel-hex" },
  { id: "arduino-nano-classic-old-bootloader", fqbn: "arduino:avr:nano", protocol: "stk500v1", baudRate: 57600, pageSize: 128, vendorIds: [0x2341, 0x0403, 0x1a86], productIds: [0x0043, 0x7523, 0x6001], artifact: "intel-hex" },
  { id: "arduino-mega-2560", fqbn: "arduino:avr:mega", protocol: "stk500v2", baudRate: 115200, pageSize: 256, vendorIds: [0x2341, 0x2a03], productIds: [0x0042, 0x0010], artifact: "intel-hex" },
  { id: "esp32", fqbn: "esp32:esp32:esp32", protocol: "esp32", baudRate: 115200, pageSize: 0, vendorIds: [0x10c4, 0x1a86, 0x303a, 0x0403], artifact: "binary" },
];

export function detectCandidates(device: Pick<DetectedDevice, "vendorId" | "productId">): BoardProfile[] {
  return BOARD_REGISTRY.filter((profile) => profile.vendorIds.includes(device.vendorId ?? -1) && (!profile.productIds || profile.productIds.includes(device.productId ?? -1)));
}

export function detectBoard(device: Pick<DetectedDevice, "vendorId" | "productId">): DetectedDevice["confidence"] {
  const candidates = detectCandidates(device);
  if (candidates.length === 1) return "high";
  if (candidates.length > 1) return "ambiguous";
  return "unknown";
}

export function getBoardProfile(boardId: string): BoardProfile {
  const profile = BOARD_REGISTRY.find((candidate) => candidate.id === boardId);
  if (!profile) throw new Error(`Placa no soportada: ${boardId}`);
  return profile;
}
