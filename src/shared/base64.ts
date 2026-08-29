export function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 === 1)
    throw new Error('Invalid base64');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const bytes = Buffer.from(padded, 'base64');
  if (bytes.toString('base64').replace(/=+$/, '') !== normalized.replace(/=+$/, ''))
    throw new Error('Invalid base64');
  return new Uint8Array(bytes);
}
export function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}
