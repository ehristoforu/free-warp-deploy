import type { WarpClient } from '../infrastructure/warp/warp-client.js';
import { generateX25519KeyPair } from '../infrastructure/crypto/x25519.js';
import { encodeBase64 } from '../shared/base64.js';
import { DEFAULT_DNS, DEFAULT_MTU } from '../shared/constants.js';
import { AMNEZIA_OBFUSCATION } from '../domain/obfuscation.js';
import { buildWireGuardConfig } from '../domain/wireguard-config.js';
import { registerWarp } from './register-warp.js';
import type { WarpscoutEndpoint } from '../domain/warpscout/endpoint.js';
import { DNS_PRESETS, type DnsPresetId } from '../domain/dns.js';
export async function generateConfig(
  client: WarpClient,
  supplied?: Uint8Array,
  endpoint?: WarpscoutEndpoint,
  options: { dnsPreset?: DnsPresetId; includeIpv6?: boolean; protocol?: 'wg' | 'awg' } = {},
): Promise<{ config: string; privateKey: string; endpoint: string; routing: 'automatic' }> {
  const pair = supplied
    ? {
        privateKey: supplied,
        publicKey: (await import('../infrastructure/crypto/x25519.js')).publicKeyFromPrivate(
          supplied,
        ),
      }
    : generateX25519KeyPair();
  const warp = await registerWarp(client, encodeBase64(pair.publicKey));
  const dns = [
    ...(DNS_PRESETS[options.dnsPreset ?? 'cloudflare']?.ipv4 ?? DEFAULT_DNS),
  ] as string[];
  if (options.includeIpv6 !== false) {
    dns.push(...(DNS_PRESETS[options.dnsPreset ?? 'cloudflare']?.ipv6 ?? []));
  }
  const profile = {
    privateKey: encodeBase64(pair.privateKey),
    peerPublicKey: warp.peerPublicKey,
    ipv4: warp.ipv4,
    ipv6: options.includeIpv6 === false ? undefined : warp.ipv6,
    dns,
    mtu: warp.mtu ?? DEFAULT_MTU,
    endpoint: endpoint
      ? `${endpoint.address.includes(':') ? `[${endpoint.address}]` : endpoint.address}:${endpoint.port}`
      : '162.159.192.1:500',
  };
  const config = buildWireGuardConfig(
    options.protocol === 'wg' ? profile : { ...profile, obfuscation: AMNEZIA_OBFUSCATION },
  );
  return {
    config,
    privateKey: encodeBase64(pair.privateKey),
    endpoint: endpoint
      ? `${endpoint.address.includes(':') ? `[${endpoint.address}]` : endpoint.address}:${endpoint.port}`
      : '162.159.192.1:500',
    routing: 'automatic',
  };
}
