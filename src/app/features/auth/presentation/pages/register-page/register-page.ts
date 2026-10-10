import { Component } from '@angular/core';
import { RegisterForm } from '@features/auth/presentation/components/register-form/register-form';
import { AuthShell } from '@shared/ui/auth-shell/auth-shell';

@Component({
  selector: 'app-register-page',
  imports: [AuthShell, RegisterForm],
  template: '<app-auth-shell><app-register-form /></app-auth-shell>',
})
export class RegisterPage {}
