import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/presentation/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Nexus · Iniciar sesión',
    loadComponent: () =>
      import('@features/auth/presentation/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    title: 'Nexus · Crear cuenta',
    loadComponent: () =>
      import('@features/auth/presentation/pages/register-page/register-page').then(
        (m) => m.RegisterPage,
      ),
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('@shared/ui/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        title: 'Nexus · Inicio',
        loadComponent: () =>
          import('@features/home/presentation/pages/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'rutinas',
        title: 'Nexus · Rutinas',
        loadComponent: () =>
          import('@features/routines/presentation/pages/routines-page/routines-page').then(
            (m) => m.RoutinesPage,
          ),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
