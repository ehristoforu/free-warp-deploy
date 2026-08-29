export const DNS_PRESETS = {
  cloudflare: {
    label: 'Cloudflare',
    ipv4: ['1.1.1.1', '1.0.0.1'],
    ipv6: ['2606:4700:4700::1111', '2606:4700:4700::1001'],
  },
  google: {
    label: 'Google',
    ipv4: ['8.8.8.8', '8.8.4.4'],
    ipv6: ['2001:4860:4860::8888', '2001:4860:4860::8844'],
  },
  yandex: {
    label: 'Яндекс',
    ipv4: ['77.88.8.8', '77.88.8.1'],
    ipv6: ['2a02:6b8::feed:0ff', '2a02:6b8:0:1::feed:0ff'],
  },
  'yandex-safe': {
    label: 'Яндекс Безопасный',
    ipv4: ['77.88.8.88', '77.88.8.2'],
    ipv6: ['2a02:6b8::feed:bad', '2a02:6b8:0:1::feed:bad'],
  },
  adguard: {
    label: 'AdGuard',
    ipv4: ['94.140.14.14', '94.140.15.15'],
    ipv6: ['2a10:50c0::ad1:ff', '2a10:50c0::ad2:ff'],
  },
  quad9: {
    label: 'Quad9',
    ipv4: ['9.9.9.9', '149.112.112.112'],
    ipv6: ['2620:fe::fe', '2620:fe::9'],
  },
} as const;
export type DnsPresetId = keyof typeof DNS_PRESETS;
