import { createHash } from 'node:crypto';
import { parseWarpscoutReport } from '../src/domain/warpscout/parser.js';
import { groupEndpoints } from '../src/domain/warpscout/registry.js';
import type { EndpointRegistry } from '../src/domain/warpscout/endpoint.js';
export function buildRegistry(report: string, now = new Date()): EndpointRegistry {
  const generatedAt = now.toISOString();
  const expires = new Date(now);
  expires.setUTCDate(expires.getUTCDate() + 7);
  return {
    schemaVersion: 1,
    generatedAt,
    verifiedAt: generatedAt,
    expiresAt: expires.toISOString(),
    sourceReportHash: `sha256:${createHash('sha256').update(report).digest('hex')}`,
    countries: groupEndpoints(parseWarpscoutReport(report)),
  };
}
