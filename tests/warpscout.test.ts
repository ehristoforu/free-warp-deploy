import { expect, it } from 'vitest';
import { parseWarpscoutReport } from '../src/domain/warpscout/parser.js';
import { buildRegistry } from '../scripts/endpoint-registry-builder.js';
import { selectEndpoint } from '../src/application/select-endpoint.js';

const report = `\uFEFF# WARP endpoints: 2 working / 3 probed\r\nENDPOINT               ENDPOINT PING TUN PING  LOSS   SEEN AS    NODE   NODE LOCATION\r\n8.34.70.140:2408       29ms          31ms      0%     RU         HEL    Helsinki, FI\r\n188.114.98.1:500       35ms          40ms      1%     DE         FRA    Frankfurt, DE\r\n# 1 torn down\r\nENDPOINT               ENDPOINT PING TUN PING  LOSS   SEEN AS    NODE   NODE LOCATION\r\n162.159.195.1:500      20ms          20ms      0%     RU         LED    St. Petersburg, RU\r\n`;

it('groups by node country and ignores SEEN AS', () => {
  const registry = buildRegistry(report, new Date('2026-08-29T00:00:00Z'));
  expect(registry.countries.FI?.endpoints).toHaveLength(1);
  expect(registry.countries.FI?.endpoints[0]?.seenAs).toBe('RU');
  expect(registry.countries.RU).toBeUndefined();
});

it('excludes torn-down rows', () => {
  expect(parseWarpscoutReport(report)).toHaveLength(2);
});

it('selects a fresh endpoint from the requested node', () => {
  const registry = buildRegistry(report, new Date('2026-08-29T00:00:00Z'));
  const endpoint = selectEndpoint(registry, 'FI', new Date('2026-08-29T01:00:00Z'));
  expect(endpoint?.nodeCountryCode).toBe('FI');
  expect(endpoint?.address).toBe('8.34.70.140');
});
