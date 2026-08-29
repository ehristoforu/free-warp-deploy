export type WireGuardConfigInput = {
  privateKey: string;
  peerPublicKey: string;
  ipv4: string;
  ipv6: string | undefined;
  dns: string[];
  mtu: number | undefined;
  endpoint: string;
};
export type WarpRegistration = { id: string; token: string };
export type WarpConfiguration = {
  peerPublicKey: string;
  ipv4: string;
  ipv6: string | undefined;
  dns: string[];
  endpoint: string;
  mtu: number | undefined;
};
