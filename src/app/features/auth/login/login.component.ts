import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  private redirectTo = '/';

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.redirectTo = params.get('redirectTo') ?? '/';
    });
  }

  submit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl(this.redirectTo);
      },
      error: (response) => {
        this.isSubmitting.set(false);
        if (response.status === 400 || response.status === 401) {
          this.error.set('Identifiants invalides. Vérifiez vos informations.');
        } else {
          this.error.set('Impossible de vous connecter pour le moment.');
        }
      }
    });
  }
}
