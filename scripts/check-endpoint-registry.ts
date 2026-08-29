import { readFile } from 'node:fs/promises';
import { endpointRegistry } from '../src/generated/endpoint-registry.js';
if (endpointRegistry.schemaVersion !== 1) throw new Error('Unsupported endpoint registry schema');
if (!Object.keys(endpointRegistry.countries).length)
  throw new Error('Endpoint registry has no countries');
for (const [code, group] of Object.entries(endpointRegistry.countries)) {
  if (!/^[A-Z]{2}$/.test(code) || !group.endpoints.length)
    throw new Error(`Invalid country group: ${code}`);
  const seen = new Set<string>();
  for (const endpoint of group.endpoints) {
    const key = `${endpoint.address}:${endpoint.port}`;
    if (seen.has(key)) throw new Error(`Duplicate endpoint: ${key}`);
    seen.add(key);
    if (endpoint.nodeCountryCode !== code)
      throw new Error(`Country grouping invariant failed: ${key}`);
  }
}
await readFile('data/warpscout-report.txt', 'utf8');
