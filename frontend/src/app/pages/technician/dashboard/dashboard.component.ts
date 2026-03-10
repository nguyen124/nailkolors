import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../services/appointment.service';
import { TechnicianService } from '../../../services/technician.service';
import { Appointment } from '../../../models';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="dashboard">
      <h2 class="page-title">My Dashboard</h2>
      <div class="stats-grid">
        <div class="stat-card card">
          <mat-icon>today</mat-icon>
          <div><span class="stat-num">{{todayAppts.length}}</span><span class="stat-label">Today</span></div>
        </div>
        <div class="stat-card card">
          <mat-icon>pending</mat-icon>
          <div><span class="stat-num">{{pendingCount}}</span><span class="stat-label">Pending</span></div>
        </div>
        <div class="stat-card card">
          <mat-icon>check_circle</mat-icon>
          <div><span class="stat-num">{{completedCount}}</span><span class="stat-label">Completed Today</span></div>
        </div>
      </div>

      <mat-card class="appts-card">
        <mat-card-header><mat-card-title>Today's Appointments</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="appt-item" *ngFor="let a of todayAppts">
            <div class="appt-time">{{a.time}}</div>
            <div class="appt-details">
              <h4>{{a.customerName}}</h4>
              <p>{{getService(a).name}} · {{a.customerPhone}}</p>
            </div>
            <div class="appt-status">
              <mat-select [value]="a.status" (selectionChange)="updateStatus(a, $event.value)">
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="confirmed">Confirmed</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </div>
          </div>
          <div class="empty" *ngIf="todayAppts.length===0">
            <mat-icon>event_available</mat-icon>
            <p>No appointments today. Enjoy your day!</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 1.8rem; margin-bottom: 24px; color: var(--primary-dark); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-card mat-icon { font-size: 32px; height: 32px; width: 32px; color: var(--primary); }
    .stat-num { display: block; font-size: 2rem; font-weight: 700; color: var(--text-dark); }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); }
    .appts-card { }
    .appt-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .appt-item:last-child { border-bottom: none; }
    .appt-time { font-size: 1.1rem; font-weight: 700; color: var(--primary); min-width: 60px; }
    .appt-details { flex: 1; }
    .appt-details h4 { margin-bottom: 4px; }
    .appt-details p { font-size: 0.85rem; color: var(--text-muted); }
    .empty { text-align: center; padding: 48px; color: var(--text-muted); }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.3; display: block; margin: 0 auto 16px; }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }
  `]
})
export class TechnicianDashboardComponent implements OnInit {
  todayAppts: Appointment[] = [];
  get pendingCount() { return this.todayAppts.filter(a => a.status === 'pending').length; }
  get completedCount() { return this.todayAppts.filter(a => a.status === 'completed').length; }

  constructor(private apptService: AppointmentService, private techService: TechnicianService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.apptService.getAll({ date: today }).subscribe(a => this.todayAppts = a);
  }

  getService(a: Appointment): any { return (a.serviceId as any) || {}; }

  updateStatus(a: Appointment, status: string) {
    this.apptService.update(a._id, { status: status as any }).subscribe({
      next: () => { a.status = status as any; this.snackBar.open('Updated', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Error', 'OK', { duration: 3000 })
    });
  }
}
