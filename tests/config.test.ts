import { expect, it } from 'vitest';
import { buildWireGuardConfig } from '../src/domain/wireguard-config.js';
import { AMNEZIA_OBFUSCATION } from '../src/domain/obfuscation.js';
it('builds a complete WireGuard profile', () => {
  const config = buildWireGuardConfig({
    privateKey: 'a'.repeat(44),
    peerPublicKey: 'b'.repeat(44),
    ipv4: '100.64.0.2/32',
    ipv6: '2606:4700::2/128',
    dns: ['1.1.1.1'],
    mtu: 1280,
    endpoint: '162.159.192.1:500',
    obfuscation: AMNEZIA_OBFUSCATION,
  });
  expect(config).toContain('[Interface]');
  expect(config).toContain('[Peer]');
  expect(config).toContain('MTU = 1280');
  expect(config).toContain('Jc = 120');
  expect(config).toContain('I1 = 0xc20000000114');
  expect(config).toContain('Address = 100.64.0.2/32, 2606:4700::2/128');
});
