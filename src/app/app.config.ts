import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { httpInterceptor } from './http.interceptor';
import { AppService } from './services/common/common.service';
import { cancelInterceptor } from './cancel.interceptor';
import { ThemeService } from './services/common/theme.service';

function initApp() {
  const appService = inject(AppService);
  return appService.loadConfig(); // <-- ensures config is loaded before app runs
}

function initTheme() {
  const themeService = inject(ThemeService);
  themeService.initializeTheme();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAppInitializer(initApp),
    provideAppInitializer(initTheme),
    provideHttpClient(withInterceptors([httpInterceptor, cancelInterceptor])),
    provideRouter(routes),
    provideStore(reducers, { metaReducers }),
    provideToastr({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    })
  ]
};
