import { InjectionToken } from '@angular/core';

export interface AppConfig {
  /** Base URL of the auth API, without trailing slash. */
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Loads the runtime configuration before bootstrapping.
 * In production `/config.json` is served by `server.mjs` from env vars,
 * so the same build can be promoted between environments.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  const response = await fetch('/config.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`No se pudo cargar /config.json (${response.status})`);
  }
  const config = (await response.json()) as Partial<AppConfig>;
  if (!config.apiUrl) {
    throw new Error('Falta "apiUrl" en /config.json');
  }
  return { apiUrl: config.apiUrl.replace(/\/+$/, '') };
}
