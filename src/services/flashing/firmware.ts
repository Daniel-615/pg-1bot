import type { Artifact } from "./types";

function hexByte(value: string, offset: number): number { return Number.parseInt(value.slice(offset, offset + 2), 16); }

export function parseIntelHex(input: string): Array<{ address: number; data: Uint8Array }> {
  let upper = 0;
  const segments: Array<{ address: number; data: Uint8Array }> = [];
  for (const [lineNumber, raw] of input.trim().split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line.startsWith(":") || line.length < 11 || line.length % 2 === 0) throw new Error(`Intel HEX inválido en línea ${lineNumber + 1}`);
    const count = hexByte(line, 1);
    const address = hexByte(line, 3) * 256 + hexByte(line, 5);
    const type = hexByte(line, 7);
    const dataEnd = 9 + count * 2;
    if (line.length < dataEnd + 2) throw new Error(`Intel HEX truncado en línea ${lineNumber + 1}`);
    let checksum = 0;
    for (let i = 1; i < dataEnd + 2; i += 2) checksum = (checksum + hexByte(line, i)) & 0xff;
    if (checksum !== 0) throw new Error(`Checksum Intel HEX inválido en línea ${lineNumber + 1}`);
    if (type === 0) segments.push({ address: upper + address, data: Uint8Array.from({ length: count }, (_, i) => hexByte(line, 9 + i * 2)) });
    else if (type === 1) break;
    else if (type === 2) upper = (hexByte(line, 9) * 256 + hexByte(line, 11)) << 4;
    else if (type === 4) upper = (hexByte(line, 9) * 256 + hexByte(line, 11)) << 16;
    else if (type !== 3 && type !== 5) throw new Error(`Registro Intel HEX no soportado: ${type}`);
  }
  const ordered = [...segments].sort((a, b) => a.address - b.address);
  for (let i = 1; i < ordered.length; i += 1) if (ordered[i - 1].address + ordered[i - 1].data.length > ordered[i].address) throw new Error("Rangos Intel HEX superpuestos");
  if (!ordered.length) throw new Error("Intel HEX sin datos de programa");
  return ordered;
}

export function validateArtifact(artifact: Artifact, expected: "intel-hex" | "binary", maxBytes: number): Artifact {
  if (artifact.format !== expected) throw new Error(`Firmware incompatible: se esperaba ${expected}, se recibió ${artifact.format}`);
  if (artifact.bytes && artifact.bytes.byteLength === 0) throw new Error("Firmware vacío");
  if ((artifact.bytes?.byteLength ?? artifact.segments?.reduce((sum, segment) => sum + segment.data.length, 0) ?? 0) > maxBytes) throw new Error("Firmware excede la memoria declarada");
  return artifact;
}
