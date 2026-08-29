import type { WarpClient } from '../infrastructure/warp/warp-client.js';
import type { WarpConfiguration } from '../domain/config.js';
export async function registerWarp(
  client: WarpClient,
  publicKey: string,
): Promise<WarpConfiguration> {
  const registration = await client.register(publicKey);
  return registration.configuration;
}
