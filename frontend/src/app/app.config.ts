import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { APP_CONFIG, AppConfig } from './core/config/app-config';
import { authInterceptor } from './core/http/auth.interceptor';
import { SpanishPaginatorIntl } from './core/i18n/spanish-paginator-intl';
import { authProviders } from './features/auth/auth.providers';
import { vulnerabilitiesProviders } from './features/vulnerabilities/vulnerabilities.providers';

export function createAppConfig(runtimeConfig: AppConfig): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(routes, withComponentInputBinding()),
      provideHttpClient(withInterceptors([authInterceptor])),
      { provide: APP_CONFIG, useValue: runtimeConfig },
      { provide: LOCALE_ID, useValue: 'es-AR' },
      { provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl },
      { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
      ...authProviders,
      ...vulnerabilitiesProviders,
    ],
  };
}
