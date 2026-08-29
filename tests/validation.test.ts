import { expect, it } from 'vitest';
import { parsePrivateKey } from '../src/shared/validation.js';
it('accepts URL-safe 32-byte keys', () =>
  expect(parsePrivateKey('AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=')).toHaveLength(32));
it('rejects malformed keys', () => expect(() => parsePrivateKey('bad')).toThrow('valid 32-byte'));
