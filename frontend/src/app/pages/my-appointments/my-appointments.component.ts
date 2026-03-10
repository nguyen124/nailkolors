import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, CommonModule],
  template: `
    <div class="page-hero"><div class="container"><h1>My Appointments</h1><p>View and manage your bookings</p></div></div>
    <section class="section">
      <div class="container">
        <div class="lookup-form card" *ngIf="!loaded">
          <h3>Find Your Appointments</h3>
          <p>Enter your email or phone number to view your bookings</p>
          <form [formGroup]="lookupForm" (ngSubmit)="lookup()">
            <mat-form-field class="full-width"><mat-label>Email Address</mat-label><input matInput formControlName="email" type="email"><mat-icon matPrefix>email</mat-icon></mat-form-field>
            <p style="text-align:center;color:var(--text-muted);margin:-8px 0 8px">or</p>
            <mat-form-field class="full-width"><mat-label>Phone Number</mat-label><input matInput formControlName="phone" type="tel"><mat-icon matPrefix>phone</mat-icon></mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width">Find Appointments</button>
          </form>
        </div>
        <div *ngIf="loaded">
          <div class="appointments-header">
            <h3>Your Appointments ({{appointments.length}})</h3>
            <button mat-stroked-button (click)="loaded=false;appointments=[]">Search Again</button>
          </div>
          <div class="appointments-list">
            <div class="appt-card card" *ngFor="let a of appointments">
              <div class="appt-header">
                <span class="status-badge" [ngClass]="a.status">{{a.status}}</span>
                <span class="appt-date">{{a.date | date:'mediumDate'}} at {{a.time}}</span>
              </div>
              <div class="appt-body">
                <div class="appt-service">
                  <mat-icon>spa</mat-icon>
                  <div>
                    <h4>{{getService(a).name}}</h4>
                    <p>\${{getService(a).price}} · {{getService(a).duration}} min</p>
                  </div>
                </div>
                <div class="appt-tech">
                  <mat-icon>person</mat-icon>
                  <span>{{getTech(a).name}}</span>
                </div>
              </div>
              <div class="appt-actions" *ngIf="a.status === 'pending' || a.status === 'confirmed'">
                <button mat-stroked-button color="warn" (click)="cancelAppt(a)">Cancel Appointment</button>
              </div>
            </div>
            <div class="empty" *ngIf="appointments.length === 0">
              <mat-icon>calendar_today</mat-icon>
              <p>No appointments found.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, var(--primary-dark), #4a148c); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .lookup-form { max-width: 480px; margin: 0 auto; padding: 40px; }
    .lookup-form h3 { font-size: 1.5rem; margin-bottom: 8px; }
    .lookup-form p { color: var(--text-muted); margin-bottom: 24px; }
    .appointments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .appointments-list { display: flex; flex-direction: column; gap: 16px; }
    .appt-card { padding: 24px; }
    .appt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .status-badge { padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
    .status-badge.pending { background: #fff8e1; color: #f57f17; }
    .status-badge.confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-badge.completed { background: #e3f2fd; color: #1565c0; }
    .status-badge.cancelled { background: #fce4ec; color: #c62828; }
    .appt-date { color: var(--text-muted); font-size: 0.9rem; }
    .appt-body { display: flex; gap: 32px; flex-wrap: wrap; }
    .appt-service, .appt-tech { display: flex; align-items: center; gap: 12px; }
    .appt-service mat-icon, .appt-tech mat-icon { color: var(--primary); }
    .appt-service h4 { margin-bottom: 2px; }
    .appt-service p { font-size: 0.85rem; color: var(--text-muted); }
    .appt-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    .empty { text-align: center; padding: 48px; color: var(--text-muted); }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.3; display: block; margin: 0 auto 16px; }
  `]
})
export class MyAppointmentsComponent {
  lookupForm: FormGroup;
  appointments: Appointment[] = [];
  loaded = false;

  constructor(private fb: FormBuilder, private apptService: AppointmentService, private snackBar: MatSnackBar) {
    this.lookupForm = this.fb.group({ email: [''], phone: [''] });
  }

  lookup() {
    const { email, phone } = this.lookupForm.value;
    if (!email && !phone) { this.snackBar.open('Please enter email or phone', 'OK', { duration: 3000 }); return; }
    this.apptService.lookup({ email, phone }).subscribe({
      next: a => { this.appointments = a; this.loaded = true; },
      error: () => this.snackBar.open('Error finding appointments', 'OK', { duration: 3000 })
    });
  }

  getService(a: Appointment): any { return (a.serviceId as any) || {}; }
  getTech(a: Appointment): any { return (a.technicianId as any) || {}; }

  cancelAppt(a: Appointment) {
    const { email, phone } = this.lookupForm.value;
    this.apptService.cancel(a._id, email, phone).subscribe({
      next: () => { a.status = 'cancelled'; this.snackBar.open('Appointment cancelled', 'OK', { duration: 3000 }); },
      error: err => this.snackBar.open(err.error?.message || 'Cancel failed', 'OK', { duration: 3000 })
    });
  }
}
