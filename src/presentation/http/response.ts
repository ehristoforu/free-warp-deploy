import { AppError } from '../../domain/errors.js';
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
export function errorResponse(error: unknown): Response {
  const appError =
    error instanceof AppError
      ? error
      : new AppError('INTERNAL_ERROR', 'Unable to process the request.');
  return jsonResponse(
    { success: false, error: { code: appError.code, message: appError.message } },
    appError.status,
  );
}
