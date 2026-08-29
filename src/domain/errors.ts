export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
  ) {
    super(message);
  }
}
export class InvalidPrivateKeyError extends AppError {
  constructor() {
    super('INVALID_PRIVATE_KEY', 'The private key must be a valid 32-byte base64 value.', 400);
  }
}
export class WarpRegistrationError extends AppError {
  constructor() {
    super('WARP_REGISTRATION_FAILED', 'Unable to register a WARP configuration.', 502);
  }
}
export class WarpEnableError extends AppError {
  constructor() {
    super('WARP_CONFIGURATION_FAILED', 'Unable to obtain the WARP configuration.', 502);
  }
}
export class InvalidWarpResponseError extends AppError {
  constructor() {
    super('INVALID_WARP_RESPONSE', 'The WARP service returned an unexpected response.', 502);
  }
}
export class ConfigurationGenerationError extends AppError {
  constructor() {
    super('CONFIGURATION_GENERATION_FAILED', 'Unable to generate the network profile.', 500);
  }
}
