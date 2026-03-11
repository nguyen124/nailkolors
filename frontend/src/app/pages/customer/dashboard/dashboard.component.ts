import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { Appointment, Service, Technician } from '../../../models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="dashboard-wrapper">
      <div class="container">
        <div class="dashboard-header">
          <div>
            <h1>Welcome back, {{user?.name}}!</h1>
            <p class="subtitle">Manage your nail appointments all in one place</p>
          </div>
          <a routerLink="/book" mat-raised-button color="primary">
            <mat-icon>add</mat-icon> Book Appointment
          </a>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card card">
            <mat-icon>pending_actions</mat-icon>
            <div><span class="num">{{upcomingCount}}</span><span class="label">Upcoming</span></div>
          </div>
          <div class="stat-card card">
            <mat-icon>check_circle</mat-icon>
            <div><span class="num">{{completedCount}}</span><span class="label">Completed</span></div>
          </div>
          <div class="stat-card card">
            <mat-icon>history</mat-icon>
            <div><span class="num">{{appointments.length}}</span><span class="label">Total Bookings</span></div>
          </div>
        </div>

        <!-- Appointments list -->
        <mat-card class="appts-card">
          <mat-card-header>
            <mat-card-title>My Appointments</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="appt-item" *ngFor="let a of appointments">
              <div class="appt-date-block">
                <span class="appt-month">{{a.date | date:'MMM'}}</span>
                <span class="appt-day">{{a.date | date:'d'}}</span>
              </div>
              <div class="appt-details">
                <h4>{{getService(a).name}}</h4>
                <p class="appt-meta">
                  <mat-icon>schedule</mat-icon> {{a.time}}
                  &nbsp;·&nbsp;
                  <mat-icon>person</mat-icon> {{getTech(a).name}}
                  &nbsp;·&nbsp;
                  <mat-icon>attach_money</mat-icon> {{getService(a).price}}
                </p>
              </div>
              <div class="appt-right">
                <span class="status-badge" [ngClass]="a.status">{{a.status}}</span>
                <button mat-stroked-button color="warn" class="cancel-btn"
                  *ngIf="a.status === 'pending' || a.status === 'confirmed'"
                  (click)="cancel(a)">Cancel</button>
              </div>
            </div>
            <div class="empty" *ngIf="appointments.length === 0">
              <mat-icon>event_note</mat-icon>
              <h3>No appointments yet</h3>
              <p>Book your first appointment and we'll take care of the rest!</p>
              <a routerLink="/book" mat-raised-button color="primary" style="margin-top:16px">Book Now</a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { min-height: calc(100vh - 130px); background: var(--bg-light); padding: 40px 0; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .dashboard-header h1 { font-size: 2rem; color: var(--primary-dark); margin-bottom: 4px; }
    .subtitle { color: var(--text-muted); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-card mat-icon { font-size: 32px; height: 32px; width: 32px; color: var(--primary); }
    .num { display: block; font-size: 2rem; font-weight: 700; color: var(--text-dark); font-family: 'Playfair Display', serif; }
    .label { font-size: 0.85rem; color: var(--text-muted); }
    .appts-card { border-radius: var(--radius) !important; }
    .appt-item { display: flex; align-items: center; gap: 20px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .appt-item:last-child { border-bottom: none; }
    .appt-date-block { width: 52px; text-align: center; background: var(--primary-light); border-radius: 10px; padding: 8px 4px; flex-shrink: 0; }
    .appt-month { display: block; font-size: 0.7rem; font-weight: 700; color: var(--primary-dark); text-transform: uppercase; }
    .appt-day { display: block; font-size: 1.5rem; font-weight: 700; color: var(--primary-dark); font-family: 'Playfair Display', serif; }
    .appt-details { flex: 1; }
    .appt-details h4 { margin-bottom: 4px; font-size: 1rem; }
    .appt-meta { display: flex; align-items: center; gap: 4px; color: var(--text-muted); font-size: 0.85rem; flex-wrap: wrap; }
    .appt-meta mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .appt-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .status-badge { padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-badge.pending { background: #fff8e1; color: #f57f17; }
    .status-badge.confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-badge.completed { background: #e3f2fd; color: #1565c0; }
    .status-badge.cancelled { background: #e8f5e9; color: #c62828; }
    .cancel-btn { font-size: 0.8rem; height: 32px; }
    .empty { text-align: center; padding: 48px 24px; color: var(--text-muted); }
    .empty mat-icon { font-size: 56px; height: 56px; width: 56px; opacity: 0.2; display: block; margin: 0 auto 16px; }
    .empty h3 { margin-bottom: 8px; color: var(--text-dark); }
    @media (max-width: 768px) { .dashboard-header { flex-direction: column; gap: 16px; } .stats-grid { grid-template-columns: 1fr; } }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  user: any = null;

  get upcomingCount() { return this.appointments.filter(a => ['pending','confirmed'].includes(a.status)).length; }
  get completedCount() { return this.appointments.filter(a => a.status === 'completed').length; }

  constructor(private apptService: AppointmentService, private authService: AuthService, private snackBar: MatSnackBar) {
    this.user = this.authService.currentUser();
  }

  ngOnInit() {
    const email = this.authService.currentUser()?.email;
    if (email) {
      this.apptService.lookup({ email }).subscribe(a => this.appointments = a);
    }
  }

  getService(a: Appointment): any { return (a.serviceId as any) || {}; }
  getTech(a: Appointment): any { return (a.technicianId as any) || {}; }

  cancel(a: Appointment) {
    const user = this.authService.currentUser();
    this.apptService.cancel(a._id, user?.email || '', user?.phone || '').subscribe({
      next: () => { a.status = 'cancelled'; this.snackBar.open('Appointment cancelled', 'OK', { duration: 3000 }); },
      error: err => this.snackBar.open(err.error?.message || 'Cancel failed', 'OK', { duration: 3000 })
    });
  }
}

