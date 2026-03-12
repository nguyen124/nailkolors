import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule, CommonModule, RouterLink],
  template: `
    <div class="register-wrapper">
      <div class="register-card card">
        <div class="register-header">
          <a routerLink="/" class="logo">💅 Serenity Nails & Spa</a>
          <h2>Create Account</h2>
          <p>Join us and enjoy exclusive perks</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="register()">
          <mat-form-field class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" autocomplete="name">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" type="tel" autocomplete="tel">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" autocomplete="new-password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPass=!showPass">
              <mat-icon>{{showPass ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-hint>At least 6 characters</mat-hint>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Minimum 6 characters</mat-error>
          </mat-form-field>

          <mat-form-field class="full-width">
            <mat-label>Register as</mat-label>
            <mat-select formControlName="role">
              <mat-option value="customer">
                <mat-icon>person</mat-icon> Client / Customer
              </mat-option>
              <mat-option value="technician">
                <mat-icon>spa</mat-icon> Nail Technician
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>badge</mat-icon>
          </mat-form-field>

          <div class="role-note" *ngIf="form.get('role')?.value === 'technician'">
            <mat-icon>info</mat-icon>
            <p>Your technician profile will be created. The admin will review and activate your account.</p>
          </div>

          <button mat-raised-button color="primary" class="full-width register-btn" type="submit" [disabled]="form.invalid || loading">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Create Account</span>
          </button>
        </form>

        <div class="divider"><span>Already have an account?</span></div>
        <a routerLink="/login" mat-stroked-button color="primary" class="full-width">Sign In</a>
        <p class="back-link"><a routerLink="/">← Back to website</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e, var(--primary-dark)); padding: 24px; }
    .register-card { width: 100%; max-width: 460px; padding: 40px; }
    .register-header { text-align: center; margin-bottom: 28px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--primary); text-decoration: none; display: block; margin-bottom: 16px; }
    .register-header h2 { margin-bottom: 8px; }
    .register-header p { color: var(--text-muted); }
    .role-note { display: flex; align-items: flex-start; gap: 10px; background: #e3f2fd; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .role-note mat-icon { color: #1565c0; font-size: 18px; height: 18px; width: 18px; flex-shrink: 0; margin-top: 2px; }
    .role-note p { font-size: 0.85rem; color: #1565c0; line-height: 1.5; }
    .register-btn { height: 48px; font-size: 1rem; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .divider { text-align: center; margin: 20px 0 12px; color: var(--text-muted); font-size: 0.9rem; }
    .back-link { text-align: center; margin-top: 16px; }
    .back-link a { color: var(--primary); text-decoration: none; font-size: 0.9rem; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPass = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required]
    });
    if (auth.isLoggedIn()) this.redirectByRole(auth.currentUser()?.role);
  }

  redirectByRole(role?: string) {
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'technician') this.router.navigate(['/technician']);
    else this.router.navigate(['/customer']);
  }

  register() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: res => {
        this.snackBar.open('Account created successfully! Welcome!', 'OK', { duration: 3000 });
        this.redirectByRole(res.user.role);
      },
      error: err => {
        this.snackBar.open(err.error?.message || 'Registration failed', 'OK', { duration: 4000 });
        this.loading = false;
      }
    });
  }
}
