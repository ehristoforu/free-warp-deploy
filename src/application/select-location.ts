import { isLocation } from '../shared/validation.js';
import type { LocationCode } from '../domain/location.js';
export function selectLocation(
  requested: string | undefined,
  configured: string | undefined,
): LocationCode {
  const value = configured ?? requested ?? 'auto';
  return isLocation(value) ? value : 'auto';
}
