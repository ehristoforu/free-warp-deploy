import { isIP } from 'node:net';
import type { WarpscoutEndpoint } from './endpoint.js';

const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria',
  AU: 'Australia',
  BE: 'Belgium',
  CA: 'Canada',
  CH: 'Switzerland',
  CZ: 'Czechia',
  DE: 'Germany',
  DK: 'Denmark',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  GB: 'United Kingdom',
  HK: 'Hong Kong',
  IE: 'Ireland',
  IT: 'Italy',
  JP: 'Japan',
  NL: 'Netherlands',
  NO: 'Norway',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  RU: 'Russia',
  SE: 'Sweden',
  SG: 'Singapore',
  UA: 'Ukraine',
  US: 'United States',
};

function numberValue(value: string): number | undefined {
  if (value === '?') return undefined;
  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function endpointValue(value: string): { address: string; port: number } | undefined {
  const text = value.trim();
  const ipv6 = text.match(/^\[([^\]]+)\]:(\d+)$/);
  const match = ipv6 ?? text.match(/^(.+):(\d+)$/);
  if (!match) return undefined;
  const address = match[1];
  const port = Number(match[2]);
  if (!address || !Number.isInteger(port) || port < 1 || port > 65535 || isIP(address) === 0)
    return undefined;
  return { address, port };
}

function countryValue(location: string): { code: string; name: string } | undefined {
  const match = location.trim().match(/,\s*([A-Z]{2})$/);
  if (!match) return undefined;
  const code = match[1];
  if (!code) return undefined;
  const name = COUNTRY_NAMES[code];
  return name ? { code, name } : undefined;
}

export function parseWarpscoutReport(input: string): WarpscoutEndpoint[] {
  const lines = input
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const endpoints = new Map<string, WarpscoutEndpoint>();
  let working = false;
  let finishedWorkingSection = false;
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith('#')) {
      if (/torn down|node picks|selected/i.test(line)) {
        working = false;
        finishedWorkingSection = true;
      }
      continue;
    }
    if (
      !finishedWorkingSection &&
      /^\s*ENDPOINT\s+ENDPOINT PING\s+TUN PING\s+LOSS\s+SEEN AS\s+NODE\s+NODE LOCATION\s*$/i.test(
        line,
      )
    ) {
      working = true;
      continue;
    }
    if (!working || !line.trim()) continue;
    const fields = line.match(/^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\s*$/);
    if (!fields) continue;
    const endpointText = fields[1];
    const endpointPing = fields[2];
    const tunnelPing = fields[3];
    const loss = fields[4];
    const seenAs = fields[5];
    const nodeCode = fields[6];
    const nodeLocation = fields[7];
    if (
      !endpointText ||
      !endpointPing ||
      !tunnelPing ||
      !loss ||
      !seenAs ||
      !nodeCode ||
      !nodeLocation
    )
      continue;
    const endpoint = endpointValue(endpointText);
    const country = countryValue(nodeLocation);
    if (!endpoint || !country) continue;
    const key = `${endpoint.address}:${endpoint.port}`;
    if (endpoints.has(key)) continue;
    endpoints.set(key, {
      ...endpoint,
      seenAs: seenAs === '?' ? undefined : seenAs,
      nodeCode: nodeCode === '?' ? undefined : nodeCode,
      nodeLocation: nodeLocation.trim(),
      nodeCountryCode: country.code,
      nodeCountryName: country.name,
      endpointPingMs: numberValue(endpointPing),
      tunnelPingMs: numberValue(tunnelPing),
      lossPercent: numberValue(loss),
    });
  }
  if (!endpoints.size) throw new Error('WARPSCOUT report contains no valid working endpoints');
  return [...endpoints.values()];
}

export { COUNTRY_NAMES };
