import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackService } from '../../services/feedback.service';

const SERVICES = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing', 'Other'];

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="page-hero">
      <div class="container">
        <h1>Share Your Feedback</h1>
        <p>As we always try the best to provide the excellent service, 
        there will be always a case where our team makes a mistake or there are misunderstandings between us. 
        We are all human-beings and we always need a second chance to make things right, 
        especially with the junior members who are trying hard to learn and improve everyday though practicing. 
        Therefore if you have any concerns or feedback, please let us know asap. We will always listen and will make it right for you.</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="form-wrap">

          <div class="form-card" *ngIf="!submitted">
            <h2>Contact Us Privately</h2>
            <p class="form-sub">Your message goes directly to us. We'll follow up with you as soon as possible.</p>

            <div class="form-group">
              <label>Your Name *</label>
              <input [(ngModel)]="form.name" placeholder="Jane Doe" />
            </div>
            <div class="form-group">
              <label>Phone <span class="optional">(optional)</span></label>
              <input [(ngModel)]="form.phone" type="tel" placeholder="(210) 000-0000" />
            </div>
            <div class="form-group">
              <label>Email <span class="optional">(optional)</span></label>
              <input [(ngModel)]="form.email" type="email" placeholder="jane@example.com" />
            </div>
            <div class="form-group">
              <label>Service</label>
              <select [(ngModel)]="form.service">
                <option value="">Select a service...</option>
                <option *ngFor="let s of services" [value]="s">{{s}}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Your Message *</label>
              <textarea [(ngModel)]="form.message" rows="5" placeholder="Please describe your concern or feedback..."></textarea>
            </div>
            <button class="btn-primary submit-btn" (click)="submit()" [disabled]="submitting">
              {{submitting ? 'Sending…' : 'Send Feedback'}}
            </button>
          </div>

          <div class="success-card" *ngIf="submitted">
            <div class="success-icon">✅</div>
            <h3>Thank You!</h3>
            <p>We've received your message and will get back to you soon.</p>
            <button class="btn-primary" (click)="submitted = false; resetForm()">Send Another</button>
          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .page-hero p { font-size: 1.1rem; opacity: 0.9; }
    .form-wrap { max-width: 560px; margin: 0 auto; }
    .form-card, .success-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .form-card h2 { margin: 0 0 6px; font-family: 'Playfair Display', serif; }
    .form-sub { color: var(--text-muted); margin: 0 0 28px; font-size: 0.9rem; line-height: 1.6; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .optional { font-weight: 400; color: #bbb; }
    .form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; font-family: inherit; transition: border 0.2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); }
    .form-group textarea { resize: vertical; }
    .submit-btn { width: 100%; padding: 14px; font-size: 1rem; margin-top: 8px; }
    .success-card { text-align: center; }
    .success-icon { font-size: 3rem; margin-bottom: 16px; }
    .success-card h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 8px; }
    .success-card p { color: var(--text-muted); margin-bottom: 24px; }
    @media (max-width: 600px) { .page-hero { padding: 48px 0; } .page-hero h1 { font-size: 2rem; } .form-card, .success-card { padding: 24px; } }
  `]
})
export class FeedbackComponent {
  submitted = false;
  submitting = false;
  services = SERVICES;
  form = this.blankForm();

  constructor(private feedbackService: FeedbackService, private snackBar: MatSnackBar) {}

  blankForm() { return { name: '', phone: '', email: '', service: '', message: '' }; }
  resetForm() { this.form = this.blankForm(); }

  submit() {
    if (!this.form.name.trim()) { this.snackBar.open('Please enter your name', '', { duration: 2000 }); return; }
    if (!this.form.message.trim()) { this.snackBar.open('Please enter your message', '', { duration: 2000 }); return; }
    this.submitting = true;
    this.feedbackService.submit(this.form).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.snackBar.open('Error sending feedback', '', { duration: 2000 }); this.submitting = false; }
    });
  }
}
