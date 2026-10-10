import { Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  email,
  form,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthService } from '@features/auth/application/auth.service';
import { RegisterCredentials } from '@features/auth/domain/models/register-credentials';

interface Feedback {
  readonly kind: 'success' | 'error';
  readonly text: string;
}

interface FieldState {
  readonly touched: () => boolean;
  readonly errors: () => readonly { readonly message?: string }[];
}

@Component({
  selector: 'app-register-form',
  imports: [FormField, RouterLink],
  templateUrl: './register-form.html',
  styleUrls: ['../auth-form.css'],
})
export class RegisterForm {
  private readonly authService = inject(AuthService);

  private readonly model = signal<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  protected readonly registerForm = form(this.model, (path) => {
    required(path.name, { message: 'Ingresa tu nombre.' });
    minLength(path.name, 2, { message: 'El nombre es demasiado corto.' });
    required(path.email, { message: 'Ingresa tu correo electrónico.' });
    email(path.email, { message: 'Escribe un correo válido.' });
    required(path.password, { message: 'Crea una contraseña.' });
    minLength(path.password, 8, { message: 'La contraseña debe tener al menos 8 caracteres.' });
    required(path.confirmPassword, { message: 'Repite tu contraseña.' });
    validate(path.confirmPassword, () =>
      this.model().password === this.model().confirmPassword
        ? undefined
        : { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden.' },
    );
    validate(path.acceptTerms, ({ value }) =>
      value()
        ? undefined
        : { kind: 'termsNotAccepted', message: 'Debes aceptar los términos y condiciones.' },
    );
  });

  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  protected readonly nameError = computed(() => this.resolve(this.registerForm.name()));
  protected readonly emailError = computed(() => this.resolve(this.registerForm.email()));
  protected readonly passwordError = computed(() => this.resolve(this.registerForm.password()));
  protected readonly confirmPasswordError = computed(() =>
    this.resolve(this.registerForm.confirmPassword()),
  );
  protected readonly termsError = computed(() => this.resolve(this.registerForm.acceptTerms()));

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((visible) => !visible);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.submitted.set(true);
    this.feedback.set(null);

    await submit(this.registerForm, {
      action: async (field) => {
        this.submitting.set(true);
        try {
          const outcome = await this.authService.signUp(field().value());
          this.feedback.set(
            outcome.kind === 'authenticated'
              ? {
                  kind: 'success',
                  text: `Cuenta creada. ¡Bienvenido, ${outcome.user.displayName}!`,
                }
              : { kind: 'error', text: outcome.message },
          );
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

  private resolve(field: FieldState): string | null {
    if (!field.touched() && !this.submitted()) {
      return null;
    }
    return field.errors()[0]?.message ?? null;
  }
}
