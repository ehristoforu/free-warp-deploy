import type { WarpClient } from '../infrastructure/warp/warp-client.js';
import { generateX25519KeyPair } from '../infrastructure/crypto/x25519.js';
import { encodeBase64 } from '../shared/base64.js';
import { DEFAULT_DNS, DEFAULT_MTU } from '../shared/constants.js';
import { AMNEZIA_OBFUSCATION } from '../domain/obfuscation.js';
import { buildWireGuardConfig } from '../domain/wireguard-config.js';
import { registerWarp } from './register-warp.js';
export async function generateConfig(
  client: WarpClient,
  supplied?: Uint8Array,
): Promise<{ config: string; privateKey: string; endpoint: string }> {
  const pair = supplied
    ? {
        privateKey: supplied,
        publicKey: (await import('../infrastructure/crypto/x25519.js')).publicKeyFromPrivate(
          supplied,
        ),
      }
    : generateX25519KeyPair();
  const warp = await registerWarp(client, encodeBase64(pair.publicKey));
  const config = buildWireGuardConfig({
    privateKey: encodeBase64(pair.privateKey),
    peerPublicKey: warp.peerPublicKey,
    ipv4: warp.ipv4,
    ipv6: warp.ipv6,
    dns: warp.dns.length ? warp.dns : DEFAULT_DNS,
    mtu: warp.mtu ?? DEFAULT_MTU,
    endpoint: '162.159.192.1:500',
    obfuscation: AMNEZIA_OBFUSCATION,
  });
  return { config, privateKey: encodeBase64(pair.privateKey), endpoint: warp.endpoint };
}
