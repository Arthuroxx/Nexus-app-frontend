import { Component } from '@angular/core';
import { LoginForm } from '@features/auth/presentation/components/login-form/login-form';
import { AuthShell } from '@shared/ui/auth-shell/auth-shell';

@Component({
  selector: 'app-login-page',
  imports: [AuthShell, LoginForm],
  template: '<app-auth-shell><app-login-form /></app-auth-shell>',
})
export class LoginPage {}
