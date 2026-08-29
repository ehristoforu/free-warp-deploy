import { describe, expect, it } from 'vitest';
import { publicKeyFromPrivate } from '../../src/infrastructure/crypto/x25519.js';
describe('X25519', () => {
  it('matches RFC 7748 test vector', () => {
    const scalar = Uint8Array.from(
      Buffer.from('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a', 'hex'),
    );
    const expected = '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a';
    expect(Buffer.from(publicKeyFromPrivate(scalar)).toString('hex')).toBe(expected);
  });
});
