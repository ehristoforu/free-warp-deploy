export const LOCATIONS = {
  auto: 'Auto',
  de: 'Germany',
  nl: 'Netherlands',
  pl: 'Poland',
  fi: 'Finland',
  gb: 'United Kingdom',
  fr: 'France',
  us: 'United States',
  ca: 'Canada',
  jp: 'Japan',
  sg: 'Singapore',
  au: 'Australia',
} as const;
export type LocationCode = keyof typeof LOCATIONS;
export type LocationPreference = { requested: LocationCode; resolved?: string };
