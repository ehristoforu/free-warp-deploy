import { expect, it } from 'vitest';
import { buildWireGuardConfig } from '../src/domain/wireguard-config.js';
it('builds a complete WireGuard profile', () => {
  const config = buildWireGuardConfig({
    privateKey: 'a'.repeat(44),
    peerPublicKey: 'b'.repeat(44),
    ipv4: '100.64.0.2/32',
    ipv6: '2606:4700::2/128',
    dns: ['1.1.1.1'],
    mtu: 1280,
    endpoint: 'engage.cloudflareclient.com:2408',
  });
  expect(config).toContain('[Interface]');
  expect(config).toContain('[Peer]');
  expect(config).toContain('MTU = 1280');
});
