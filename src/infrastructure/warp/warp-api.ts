import {
  InvalidWarpResponseError,
  WarpEnableError,
  WarpRegistrationError,
} from '../../domain/errors.js';
import type { WarpClient } from './warp-client.js';
import type { WarpConfiguration, WarpRegistration } from '../../domain/config.js';
export class CloudflareWarpClient implements WarpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher = fetch,
    private readonly timeoutMs = 10000,
  ) {}
  async request(path: string, init: RequestInit): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetcher(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          'user-agent': 'okhttp/3.12.1',
          ...(init.headers ?? {}),
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object') throw new Error('Invalid JSON');
      return body as Record<string, unknown>;
    } finally {
      clearTimeout(timer);
    }
  }
  private parseConfiguration(body: Record<string, unknown>): WarpConfiguration {
    const config = body.config as Record<string, unknown> | undefined;
    const interfaceData = config?.interface as Record<string, unknown> | undefined;
    const peer = config?.peers as Array<Record<string, unknown>> | undefined;
    const first = peer?.[0];
    const endpoint = first?.endpoint as Record<string, unknown> | undefined;
    const addresses = interfaceData?.addresses as Record<string, unknown> | undefined;
    if (
      typeof first?.public_key !== 'string' ||
      typeof addresses?.v4 !== 'string' ||
      typeof addresses.v6 !== 'string' ||
      typeof endpoint?.host !== 'string'
    )
      throw new InvalidWarpResponseError();
    return {
      peerPublicKey: first.public_key,
      ipv4: addresses.v4,
      ipv6: addresses.v6,
      dns: ['1.1.1.1', '2606:4700:4700::1111', '1.0.0.1', '2606:4700:4700::1001'],
      endpoint: endpoint.host,
      mtu: 1280,
    };
  }
  async register(publicKey: string): Promise<WarpRegistration> {
    try {
      const body = await this.request('/reg', {
        method: 'POST',
        body: JSON.stringify({
          key: publicKey,
          install_id: '',
          fcm_token: '',
          tos: new Date().toISOString(),
          type: 'ios',
          model: 'free-warp-deploy',
          locale: 'en_US',
        }),
      });
      const result = body.result as Record<string, unknown> | undefined;
      if (typeof result?.id !== 'string' || typeof result.token !== 'string') throw new Error();
      return { id: result.id, token: result.token };
    } catch {
      throw new WarpRegistrationError();
    }
  }
  async enableWarp(id: string, token: string): Promise<WarpConfiguration> {
    try {
      const body = await this.request(`/reg/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ warp_enabled: true }),
      });
      const result = body.result as Record<string, unknown> | undefined;
      if (!result) throw new Error();
      return this.parseConfiguration(result);
    } catch {
      throw new WarpEnableError();
    }
  }
}
