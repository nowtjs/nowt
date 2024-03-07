import type { TlsOptions } from 'node:tls';

export interface AdapterConfig {
  /**
   * The TLS configuration.
   */
  tls?: TlsOptions;
}
