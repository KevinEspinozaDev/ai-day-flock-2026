import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { createAppConfig } from './app/app.config';
import { loadAppConfig } from './app/core/config/app-config';

registerLocaleData(localeEsAr);

loadAppConfig()
  .then((config) => bootstrapApplication(App, createAppConfig(config)))
  .catch((err) => {
    console.error(err);
    document.body.innerHTML =
      '<p style="font-family:sans-serif;padding:24px">No se pudo iniciar la aplicación. Revisá la configuración.</p>';
  });
