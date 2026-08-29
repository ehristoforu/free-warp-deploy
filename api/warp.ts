import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleWarp } from '../src/presentation/http/handler.js';

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const body = request.method === 'POST' ? await readBody(request) : undefined;
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(', '));
  }
  const init: RequestInit = { method: request.method ?? 'GET', headers };
  if (body !== undefined) init.body = body;
  const webRequest = new Request(
    `https://${request.headers.host ?? 'localhost'}${request.url ?? '/api/warp'}`,
    init,
  );
  const webResponse = await handleWarp(webRequest);
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => response.setHeader(name, value));
  response.end(await webResponse.text());
}
