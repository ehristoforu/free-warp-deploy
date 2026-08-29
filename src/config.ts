import { DEFAULT_WARP_API_BASE_URL } from './shared/constants.js';
import { isLocation } from './shared/validation.js';
import type { LocationCode } from './domain/location.js';
export type AppConfig = { preferredLocation: LocationCode; warpApiBaseUrl: string };
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const preferred = env.WARP_PREFERRED_LOCATION ?? 'auto';
  return {
    preferredLocation: isLocation(preferred) ? preferred : 'auto',
    warpApiBaseUrl: env.WARP_API_BASE_URL ?? DEFAULT_WARP_API_BASE_URL,
  };
}
