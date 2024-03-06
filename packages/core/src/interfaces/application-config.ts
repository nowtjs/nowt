import type { TlsOptions } from 'node:tls';

export interface ApplicationConfig {
  /**
   * The TLS configuration
   */
  tls?: TlsOptions;
}
