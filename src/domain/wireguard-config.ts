import type { WireGuardConfigInput } from './config.js';
export function buildWireGuardConfig(input: WireGuardConfigInput): string {
  const addresses = [input.ipv4, input.ipv6]
    .filter((address): address is string => Boolean(address))
    .map((address) =>
      address.includes('/') ? address : `${address}/${address.includes(':') ? 128 : 32}`,
    )
    .join(', ');
  const obfuscation = input.obfuscation;
  const lines = [
    '[Interface]',
    `PrivateKey = ${input.privateKey}`,
    ...(obfuscation
      ? [
          `S1 = ${obfuscation.s1}`,
          `S2 = ${obfuscation.s2}`,
          `Jc = ${obfuscation.jc}`,
          `Jmin = ${obfuscation.jmin}`,
          `Jmax = ${obfuscation.jmax}`,
          `H1 = ${obfuscation.h1}`,
          `H2 = ${obfuscation.h2}`,
          `H3 = ${obfuscation.h3}`,
          `H4 = ${obfuscation.h4}`,
          `I1 = ${obfuscation.i1}`,
        ]
      : []),
    `MTU = ${input.mtu ?? 1280}`,
    `Address = ${addresses}`,
    `DNS = ${input.dns.join(', ')}`,
    '',
    '[Peer]',
    `PublicKey = ${input.peerPublicKey}`,
    'AllowedIPs = 0.0.0.0/0, ::/0',
    `Endpoint = ${input.endpoint}`,
    'PersistentKeepalive = 25',
  ];
  return `${lines.join('\n')}\n`;
}
