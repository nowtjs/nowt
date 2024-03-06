import type { AdapterConfig } from './adapter-config';

export interface AdapterEnvironment {
  /**
   * Configuration for the [ExpressAdapter]
   */
  config?: AdapterConfig;
}
