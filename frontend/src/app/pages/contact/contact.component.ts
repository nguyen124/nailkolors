import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, ReactiveFormsModule, CommonModule],
  template: `
    <div class="page-hero"><div class="container"><h1>Contact Us</h1><p>We'd love to hear from you</p></div></div>
    <section class="section">
      <div class="container contact-grid">
        <div class="contact-info">
          <h2>Visit Us</h2>
          <div class="info-item"><mat-icon>location_on</mat-icon><div><h4>Address</h4><p>646 West FM 78, Ste 113<br>Cibolo, TX 78108</p></div></div>
          <div class="info-item"><mat-icon>phone</mat-icon><div><h4>Phone</h4><p>(555) 123-4567</p></div></div>
          <div class="info-item"><mat-icon>email</mat-icon><div><h4>Email</h4><p>hello&#64;serenitynailsspa.com</p></div></div>
          <div class="info-item"><mat-icon>schedule</mat-icon><div><h4>Hours</h4><p>Mon–Sat: 9:30am–7pm<br>Sun: 11:30am–5pm</p></div></div>
        </div>
        <div class="contact-form card">
          <h2>Send a Message</h2>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field class="full-width"><mat-label>Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field class="full-width"><mat-label>Email</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
            <mat-form-field class="full-width"><mat-label>Message</mat-label><textarea matInput formControlName="message" rows="5"></textarea></mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    .contact-info h2, .contact-form h2 { font-size: 1.8rem; margin-bottom: 24px; color: var(--primary-dark); }
    .info-item { display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-start; }
    .info-item mat-icon { color: var(--primary); font-size: 28px; height: 28px; width: 28px; margin-top: 4px; }
    .info-item h4 { margin-bottom: 4px; }
    .info-item p { color: var(--text-muted); line-height: 1.6; }
    .contact-form { padding: 32px; }
    @media (max-width: 768px) { .page-hero { padding: 48px 0; } .page-hero h1 { font-size: 2rem; } .contact-grid { grid-template-columns: 1fr; gap: 24px; } .contact-info h2, .contact-form h2 { font-size: 1.4rem; } }
    @media (max-width: 480px) { .page-hero h1 { font-size: 1.6rem; } .contact-form { padding: 20px; } }
  `]
})
export class ContactComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], message: ['', Validators.required] });
  }
  submit() { this.snackBar.open('Message sent! We will get back to you soon.', 'OK', { duration: 4000 }); this.form.reset(); }
}
