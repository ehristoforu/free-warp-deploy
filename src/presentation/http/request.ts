export async function requestBody(request: Request): Promise<Record<string, unknown>> {
  if (
    (request.headers.get('content-length') &&
      Number(request.headers.get('content-length')) > 4096) ||
    request.method !== 'POST'
  )
    return {};
  const body: unknown = await request.json();
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}
