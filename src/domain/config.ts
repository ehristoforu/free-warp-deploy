export type WireGuardConfigInput = {
  privateKey: string;
  peerPublicKey: string;
  ipv4: string;
  ipv6: string | undefined;
  dns: string[];
  mtu: number | undefined;
  endpoint: string;
  obfuscation?: WireGuardObfuscationProfile;
};
export type WireGuardObfuscationProfile = {
  s1: number;
  s2: number;
  jc: number;
  jmin: number;
  jmax: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  i1: string;
};
export type WarpRegistration = {
  id: string;
  token: string;
};
export type WarpConfiguration = {
  peerPublicKey: string;
  ipv4: string;
  ipv6: string | undefined;
  dns: string[];
  endpoint: string;
  mtu: number | undefined;
};
