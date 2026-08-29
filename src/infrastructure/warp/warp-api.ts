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
        headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object') throw new Error('Invalid JSON');
      return body as Record<string, unknown>;
    } finally {
      clearTimeout(timer);
    }
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
          type: 'Android',
          locale: 'en_US',
        }),
      });
      if (typeof body.id !== 'string' || typeof body.token !== 'string') throw new Error();
      return { id: body.id, token: body.token };
    } catch {
      throw new WarpRegistrationError();
    }
  }
  async enableWarp(id: string, token: string): Promise<WarpConfiguration> {
    try {
      const body = await this.request(`/reg/${encodeURIComponent(id)}/account`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const config = body.config as Record<string, unknown> | undefined;
      const interfaceData = config?.interface as Record<string, unknown> | undefined;
      const peer = config?.peers as Array<Record<string, unknown>> | undefined;
      const first = peer?.[0];
      if (
        typeof first?.public_key !== 'string' ||
        typeof interfaceData?.addresses !== 'object' ||
        typeof first.endpoint !== 'string'
      )
        throw new Error();
      const addresses = interfaceData.addresses as Record<string, unknown>;
      if (typeof addresses.v4 !== 'string') throw new Error();
      return {
        peerPublicKey: first.public_key,
        ipv4: addresses.v4,
        ipv6: typeof addresses.v6 === 'string' ? addresses.v6 : undefined,
        dns: Array.isArray(interfaceData.dns)
          ? interfaceData.dns.filter((x): x is string => typeof x === 'string')
          : [],
        endpoint: first.endpoint,
        mtu: typeof interfaceData.mtu === 'number' ? interfaceData.mtu : undefined,
      };
    } catch {
      throw new WarpEnableError();
    }
  }
}
