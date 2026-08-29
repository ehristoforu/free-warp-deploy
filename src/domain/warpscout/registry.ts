import type { EndpointRegistry, WarpscoutEndpoint } from './endpoint.js';
export function isRegistryFresh(registry: EndpointRegistry, now = new Date()): boolean {
  return (
    Number.isFinite(Date.parse(registry.expiresAt)) &&
    now.getTime() < Date.parse(registry.expiresAt)
  );
}
export function groupEndpoints(endpoints: WarpscoutEndpoint[]): EndpointRegistry['countries'] {
  const countries: EndpointRegistry['countries'] = {};
  for (const endpoint of endpoints) {
    const country = (countries[endpoint.nodeCountryCode] ??= {
      name: endpoint.nodeCountryName,
      endpoints: [],
    });
    country.endpoints.push(endpoint);
  }
  return countries;
}
