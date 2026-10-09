import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · VulnPrio',
    loadComponent: () =>
      import('./features/auth/presentation/login-page/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/shell/shell.layout').then((m) => m.ShellLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'upload',
        title: 'Subir Excel · VulnPrio',
        loadComponent: () =>
          import('./features/vulnerabilities/presentation/upload-page/upload.page').then(
            (m) => m.UploadPage,
          ),
      },
      {
        path: 'dashboard',
        title: 'Dashboard · VulnPrio',
        loadComponent: () =>
          import('./features/vulnerabilities/presentation/dashboard-page/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
