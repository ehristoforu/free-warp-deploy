import { CloudflareWarpClient } from '../../infrastructure/warp/warp-api.js';
import { generateConfig } from '../../application/generate-config.js';
import { loadConfig } from '../../config.js';
import { parsePrivateKey } from '../../shared/validation.js';
import { errorResponse, jsonResponse } from './response.js';
import { requestBody } from './request.js';
import { endpointRegistry } from '../../generated/endpoint-registry.js';
import { selectEndpoint } from '../../application/select-endpoint.js';
import { DNS_PRESETS, type DnsPresetId } from '../../domain/dns.js';
export async function handleWarp(request: Request): Promise<Response> {
  try {
    if (request.method !== 'GET' && request.method !== 'POST')
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, POST' } });
    const url = new URL(request.url);
    const body = await requestBody(request);
    if (request.method === 'GET' && url.searchParams.get('metadata') === '1') {
      return jsonResponse({
        success: true,
        registry: {
          verifiedAt: endpointRegistry.verifiedAt,
          expiresAt: endpointRegistry.expiresAt,
          nodes: Object.entries(endpointRegistry.countries).map(([code, group]) => ({
            code,
            name: group.name,
            count: group.endpoints.length,
          })),
        },
      });
    }
    const rawKey =
      typeof body.key === 'string' ? body.key : (url.searchParams.get('key') ?? undefined);
    const endpointMode = body.endpointMode === 'node' ? 'node' : 'auto';
    const nodeCountry =
      typeof body.nodeCountry === 'string'
        ? body.nodeCountry.toUpperCase()
        : typeof body.location === 'string'
          ? body.location.toUpperCase()
          : undefined;
    const selectedEndpoint =
      endpointMode === 'node' ? selectEndpoint(endpointRegistry, nodeCountry) : undefined;
    const dnsPreset =
      typeof body.dnsPreset === 'string' && body.dnsPreset in DNS_PRESETS
        ? (body.dnsPreset as DnsPresetId)
        : 'cloudflare';
    const protocol = 'wg';
    const includeIpv6 = body.includeIpv6 !== false;
    const result = await generateConfig(
      new CloudflareWarpClient(loadConfig().warpApiBaseUrl),
      parsePrivateKey(rawKey),
      selectedEndpoint,
      { dnsPreset, includeIpv6, protocol },
    );
    if (
      url.searchParams.get('format') === 'config' ||
      request.headers.get('accept')?.includes('text/plain')
    )
      return new Response(result.config, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'content-disposition': 'attachment; filename="warp.conf"',
          'cache-control': 'no-store',
        },
      });
    return jsonResponse({
      success: true,
      config: result.config,
      filename: 'warp.conf',
      location: {
        requested: nodeCountry ?? loadConfig().preferredLocation,
        resolved: result.endpoint,
      },
      selection: selectedEndpoint
        ? {
            mode: 'node',
            nodeCountry: selectedEndpoint.nodeCountryCode,
            node: selectedEndpoint.nodeCode,
            nodeLocation: selectedEndpoint.nodeLocation,
            seenAs: selectedEndpoint.seenAs,
            verifiedAt: endpointRegistry.verifiedAt,
            confidence: 'best-effort',
          }
        : {
            mode: 'auto',
            source: 'built-in-default',
            endpoint: result.endpoint,
            confidence: 'auto',
          },
      profile: { protocol, dnsPreset, routingMode: 'full', includeIpv6 },
      availableNodes: Object.entries(endpointRegistry.countries).map(([code, group]) => ({
        code,
        name: group.name,
        count: group.endpoints.length,
      })),
      routing: result.routing,
      observed: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
