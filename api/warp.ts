import { handleWarp } from '../src/presentation/http/handler.js';
export default async function handler(request: Request): Promise<Response> {
  return handleWarp(request);
}
