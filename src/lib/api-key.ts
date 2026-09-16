import crypto from "crypto";

export function verifyApiKey(provided: string | null | undefined): boolean {
  const expected = process.env.DEVICE_API_KEY ?? "";
  if (!expected || !provided) return false;

  const providedBuf = Buffer.from(provided, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  if (providedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}
