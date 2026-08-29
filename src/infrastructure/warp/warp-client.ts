import type { WarpConfiguration, WarpRegistration } from '../../domain/config.js';
export interface WarpClient {
  register(publicKey: string): Promise<WarpRegistration>;
  enableWarp(id: string, token: string): Promise<WarpConfiguration>;
}
