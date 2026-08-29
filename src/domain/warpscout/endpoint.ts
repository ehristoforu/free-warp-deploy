export type WarpscoutEndpoint = {
  address: string;
  port: number;
  seenAs: string | undefined;
  nodeCode: string | undefined;
  nodeLocation: string;
  nodeCountryCode: string;
  nodeCountryName: string;
  endpointPingMs: number | undefined;
  tunnelPingMs: number | undefined;
  lossPercent: number | undefined;
};

export type EndpointRegistry = {
  schemaVersion: 1;
  generatedAt: string;
  verifiedAt: string;
  expiresAt: string;
  sourceReportHash: string;
  countries: Record<string, { name: string; endpoints: WarpscoutEndpoint[] }>;
};
