import { encodeBase64 } from '../../shared/base64.js';
import type { KeyPair } from '../../domain/keypair.js';
const P = (1n << 255n) - 19n;
const clamp = (k: Uint8Array) => {
  const r = new Uint8Array(k);
  r[0] = (r[0] ?? 0) & 248;
  r[31] = ((r[31] ?? 0) & 127) | 64;
  return r;
};
const le = (b: Uint8Array) => b.reduce((n, x, i) => n + BigInt(x) * (1n << BigInt(i * 8)), 0n);
const out = (n: bigint) => {
  const r = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    r[i] = Number(n & 255n);
    n >>= 8n;
  }
  return r;
};
const mod = (n: bigint) => ((n % P) + P) % P;
function scalarMult(secret: Uint8Array, uBytes: Uint8Array): Uint8Array {
  const k = le(clamp(secret));
  let x1 = le(uBytes) & ((1n << 255n) - 1n);
  let x2 = 1n,
    z2 = 0n,
    x3 = x1,
    z3 = 1n,
    swap = 0n;
  for (let t = 254; t >= 0; t--) {
    const kt = (k >> BigInt(t)) & 1n;
    swap ^= kt;
    if (swap) {
      [x2, x3] = [x3, x2];
      [z2, z3] = [z3, z2];
    }
    swap = kt;
    const a = mod(x2 + z2),
      aa = mod(a * a),
      b = mod(x2 - z2),
      bb = mod(b * b),
      e = mod(aa - bb),
      c = mod(x3 + z3),
      d = mod(x3 - z3),
      da = mod(d * a),
      cb = mod(c * b);
    x3 = mod((da + cb) ** 2n);
    z3 = mod(x1 * (da - cb) ** 2n);
    x2 = mod(aa * bb);
    z2 = mod(e * mod(aa + 121665n * e));
  }
  if (swap) {
    [x2, x3] = [x3, x2];
    [z2, z3] = [z3, z2];
  }
  return out(mod(x2 * modPow(z2, P - 2n)));
}
function modPow(base: bigint, exponent: bigint): bigint {
  let result = 1n;
  let b = mod(base);
  for (let e = exponent; e; e >>= 1n) {
    if (e & 1n) result = mod(result * b);
    b = mod(b * b);
  }
  return result;
}
export function generateX25519KeyPair(
  randomBytes: (size: number) => Uint8Array = (size) =>
    crypto.getRandomValues(new Uint8Array(size)),
): KeyPair {
  const privateKey = randomBytes(32);
  const publicKey = scalarMult(privateKey, Uint8Array.from([9, ...new Array(31).fill(0)]));
  return { privateKey, publicKey };
}
export function publicKeyFromPrivate(privateKey: Uint8Array): Uint8Array {
  return scalarMult(privateKey, Uint8Array.from([9, ...new Array(31).fill(0)]));
}
export { encodeBase64 };
