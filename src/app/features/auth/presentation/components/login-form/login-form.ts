import { Component, computed, inject, signal } from '@angular/core';
import { FormField, email, form, minLength, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@features/auth/application/auth.service';
import { LoginCredentials } from '@features/auth/domain/models/login-credentials';

interface Feedback {
  readonly kind: 'success' | 'error';
  readonly text: string;
}

@Component({
  selector: 'app-login-form',
  imports: [FormField, RouterLink],
  templateUrl: './login-form.html',
  styleUrls: ['../auth-form.css'],
})
export class LoginForm {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly model = signal<LoginCredentials>({
    email: '',
    password: '',
    remember: false,
  });

  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: 'Ingresa tu correo electrónico.' });
    email(path.email, { message: 'Escribe un correo válido.' });
    required(path.password, { message: 'Ingresa tu contraseña.' });
    minLength(path.password, 8, { message: 'La contraseña debe tener al menos 8 caracteres.' });
  });

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  protected readonly emailError = computed(() => {
    const field = this.loginForm.email();
    if (!field.touched() && !this.submitted()) {
      return null;
    }
    return field.errors()[0]?.message ?? null;
  });

  protected readonly passwordError = computed(() => {
    const field = this.loginForm.password();
    if (!field.touched() && !this.submitted()) {
      return null;
    }
    return field.errors()[0]?.message ?? null;
  });

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.submitted.set(true);
    this.feedback.set(null);

    await submit(this.loginForm, {
      action: async (field) => {
        this.submitting.set(true);
        try {
          const outcome = await this.authService.signIn(field().value());
          if (outcome.kind === 'authenticated') {
            await this.router.navigate(['/inicio']);
            return;
          }
          this.feedback.set({ kind: 'error', text: outcome.message });
        } catch {
          this.feedback.set({
            kind: 'error',
            text: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
          });
        } finally {
          this.submitting.set(false);
        }
      },
    });
  }
}
