import { esp32Simulator } from "./esp32/esp32Simulator";
import type { BoardSimulator, SimulatorBoard } from "./types";

const simulators: Record<SimulatorBoard, BoardSimulator> = {
  esp32: esp32Simulator,
};

export function getBoardSimulator(board: string) {
  return simulators[board as SimulatorBoard] ?? null;
}
