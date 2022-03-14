export function stringToAsciiBytes32(i: string) {
  const result = Buffer.alloc(32);
  const bytes = Buffer.from(i, "ascii");
  bytes.copy(result, result.length - bytes.length);
  return "0x" + result.toString("hex");
}

export function asciiBytes32ToString(bytes: string) {
  const buffer = Buffer.from(bytes.substring(2), "hex");
  return buffer.toString("ascii").replaceAll(String.fromCharCode(0), "");
}

export const zeroAddress = "0x0000000000000000000000000000000000000000";
export const zero32Byte =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
