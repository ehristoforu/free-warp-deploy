import { decodeBase64 } from './base64.js';
import { InvalidPrivateKeyError } from '../domain/errors.js';
export function parsePrivateKey(value: string | undefined): Uint8Array | undefined {
  if (value === undefined) return undefined;
  try {
    const bytes = decodeBase64(value);
    if (bytes.length !== 32) throw new Error();
    return bytes;
  } catch {
    throw new InvalidPrivateKeyError();
  }
}
export function isLocation(value: string): value is import('../domain/location.js').LocationCode {
  return (
    value in
    { auto: 1, de: 1, nl: 1, pl: 1, fi: 1, gb: 1, fr: 1, us: 1, ca: 1, jp: 1, sg: 1, au: 1 }
  );
}
