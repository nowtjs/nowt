import type { TlsOptions } from 'tls';

export interface AdapterConfig {
  /**
   * The TLS configuration.
   */
  tls?: TlsOptions;
}
