import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];
