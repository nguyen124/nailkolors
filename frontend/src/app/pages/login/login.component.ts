import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, CommonModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-card card">
        <div class="login-header">
          <div class="logo">💅 Serenity Nails & Spa</div>
          <h2>Sign In</h2>
          <p>Welcome back! Sign in to your account</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="login()">
          <mat-form-field class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>
          <mat-form-field class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" autocomplete="current-password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPass=!showPass">
              <mat-icon>{{showPass ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
          <button mat-raised-button color="primary" class="full-width login-btn" type="submit" [disabled]="form.invalid || loading">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>
        <div class="divider"><span>Don't have an account?</span></div>
        <a routerLink="/register" mat-stroked-button color="primary" class="full-width register-btn">Create Account</a>
        <p class="back-link"><a routerLink="/">← Back to website</a></p>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e, var(--primary-dark)); padding: 24px; }
    .login-card { width: 100%; max-width: 420px; padding: 40px; }
    .login-header { text-align: center; margin-bottom: 32px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--primary); margin-bottom: 16px; }
    .login-header h2 { margin-bottom: 8px; }
    .login-header p { color: var(--text-muted); }
    .login-btn { height: 48px; font-size: 1rem; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .divider { text-align: center; margin: 24px 0 12px; color: var(--text-muted); font-size: 0.9rem; }
    .register-btn { height: 44px; }
    .back-link { text-align: center; margin-top: 16px; }
    .back-link a { color: var(--primary); text-decoration: none; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPass = false;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]] });
    if (auth.isLoggedIn()) { this.redirectByRole(auth.currentUser()?.role); }
  }
  redirectByRole(role?: string) {
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'technician') this.router.navigate(['/technician']);
    else this.router.navigate(['/customer']);
  }

  login() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: res => this.redirectByRole(res.user.role),
      error: err => { this.snackBar.open(err.error?.message || 'Login failed', 'OK', { duration: 3000 }); this.loading = false; }
    });
  }
}
