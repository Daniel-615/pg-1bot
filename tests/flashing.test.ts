import { describe, expect, it } from "vitest";
import { detectCandidates } from "../src/services/flashing/boards";
import { parseIntelHex } from "../src/services/flashing/firmware";

describe("Web Serial flashing primitives", () => {
  it("identifies an authorized Uno VID/PID", () => {
    expect(detectCandidates({ vendorId: 0x2341, productId: 0x0043 }).some((board) => board.id === "arduino-uno-r3")).toBe(true);
  });

  it("rejects a corrupted Intel HEX checksum", () => {
    expect(() => parseIntelHex(":0400000001020304F3\n:00000001FF")).toThrow("Checksum");
  });

  it("parses extended addresses and EOF", () => {
    const result = parseIntelHex(":020000040001F9\n:020010000102EB\n:00000001FF");
    expect(result[0].address).toBe(0x10010);
    expect([...result[0].data]).toEqual([1, 2]);
  });
});
