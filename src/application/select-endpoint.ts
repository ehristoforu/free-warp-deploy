import { randomInt } from 'node:crypto';
import type { EndpointRegistry, WarpscoutEndpoint } from '../domain/warpscout/endpoint.js';
import { isRegistryFresh } from '../domain/warpscout/registry.js';
export function selectEndpoint(
  registry: EndpointRegistry | undefined,
  country: string | undefined,
  now = new Date(),
): WarpscoutEndpoint | undefined {
  if (!registry || !country || !isRegistryFresh(registry, now)) return undefined;
  const group = registry.countries[country.toUpperCase()];
  if (!group?.endpoints.length) return undefined;
  const zeroLoss = group.endpoints.filter((endpoint) => endpoint.lossPercent === 0);
  const pool = zeroLoss.length ? zeroLoss : group.endpoints;
  const ranked = [...pool].sort(
    (a, b) => (a.tunnelPingMs ?? Infinity) - (b.tunnelPingMs ?? Infinity),
  );
  const candidates = ranked.slice(0, Math.min(25, ranked.length));
  return candidates[randomInt(candidates.length)];
}
