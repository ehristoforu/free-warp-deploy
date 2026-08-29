import type { WireGuardConfigInput } from './config.js';
export function buildWireGuardConfig(input: WireGuardConfigInput): string {
  const addresses = [input.ipv4, input.ipv6].filter(Boolean).join(', ');
  return `[Interface]\nPrivateKey = ${input.privateKey}\nAddress = ${addresses}\nDNS = ${input.dns.join(', ')}\nMTU = ${input.mtu ?? 1280}\n\n[Peer]\nPublicKey = ${input.peerPublicKey}\nAllowedIPs = 0.0.0.0/0, ::/0\nEndpoint = ${input.endpoint}\nPersistentKeepalive = 25\n`;
}
