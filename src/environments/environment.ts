/**
 * Configuracion de entorno de la aplicacion.
 *
 * Los valores provienen de `window.__nexusEnv`, un objeto generado en `public/env.js`
 * a partir del archivo `.env` (ver `scripts/generate-env.mjs` y `npm run generate:env`).
 *
 * Este archivo NO contiene valores de entorno hardcodeados; solo declara el contrato.
 */
export interface AppEnvironment {
  readonly apiUrl: string;
}

declare global {
  interface Window {
    __nexusEnv?: Partial<AppEnvironment>;
  }
}

const runtimeConfig: Partial<AppEnvironment> =
  typeof window !== 'undefined' ? (window.__nexusEnv ?? {}) : {};

export const environment: AppEnvironment = {
  apiUrl: runtimeConfig.apiUrl ?? '',
};
