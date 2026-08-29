import { CloudflareWarpClient } from '../../infrastructure/warp/warp-api.js';
import { generateConfig } from '../../application/generate-config.js';
import { loadConfig } from '../../config.js';
import { parsePrivateKey } from '../../shared/validation.js';
import { decodeBase64 } from '../../shared/base64.js';
import { errorResponse, jsonResponse } from './response.js';
import { requestBody } from './request.js';
export async function handleWarp(request: Request): Promise<Response> {
  try {
    if (request.method !== 'GET' && request.method !== 'POST')
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, POST' } });
    const url = new URL(request.url);
    const body = await requestBody(request);
    const rawKey =
      typeof body.key === 'string' ? body.key : (url.searchParams.get('key') ?? undefined);
    const result = await generateConfig(
      new CloudflareWarpClient(loadConfig().warpApiBaseUrl),
      parsePrivateKey(rawKey),
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
        requested:
          typeof body.location === 'string' ? body.location : loadConfig().preferredLocation,
        resolved: result.endpoint,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
