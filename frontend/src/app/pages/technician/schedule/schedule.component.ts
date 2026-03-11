import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models';

@Component({
  selector: 'app-technician-schedule',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="schedule">
      <h2 class="page-title">My Schedule</h2>
      <div class="schedule-layout">
        <mat-card class="calendar-card">
          <mat-card-content>
            <mat-calendar [(selected)]="selectedDate" (selectedChange)="onDateSelect($event)"></mat-calendar>
          </mat-card-content>
        </mat-card>
        <mat-card class="appts-card">
          <mat-card-header>
            <mat-card-title>{{selectedDate | date:'fullDate'}}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="appt-item" *ngFor="let a of dayAppointments">
              <div class="time-block">
                <span class="time">{{a.time}}</span>
                <div class="time-line"></div>
              </div>
              <div class="appt-card-inner" [ngClass]="a.status">
                <div class="appt-header-inner">
                  <h4>{{a.customerName}}</h4>
                  <span class="status-chip {{a.status}}">{{a.status}}</span>
                </div>
                <p>{{getService(a).name}}</p>
                <p class="phone">{{a.customerPhone}}</p>
              </div>
            </div>
            <div class="empty" *ngIf="dayAppointments.length===0">
              <mat-icon>event_note</mat-icon>
              <p>No appointments on this day</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 1.8rem; margin-bottom: 24px; color: var(--primary-dark); }
    .schedule-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; }
    .calendar-card, .appts-card { }
    .appt-item { display: flex; gap: 16px; margin-bottom: 16px; }
    .time-block { display: flex; flex-direction: column; align-items: center; width: 60px; }
    .time { font-size: 0.85rem; font-weight: 700; color: var(--primary); }
    .time-line { flex: 1; width: 2px; background: var(--primary-light); margin: 4px 0; }
    .appt-card-inner { flex: 1; padding: 12px 16px; border-radius: 10px; border-left: 3px solid var(--primary); background: var(--bg-light); }
    .appt-card-inner.completed { border-color: #4caf50; background: #f1f8e9; }
    .appt-card-inner.cancelled { border-color: #f44336; background: #e8f5e9; opacity: 0.7; }
    .appt-header-inner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .appt-header-inner h4 { font-size: 1rem; }
    .status-chip { font-size: 0.7rem; padding: 2px 8px; border-radius: 50px; font-weight: 700; }
    .status-chip.pending { background: #fff8e1; color: #f57f17; }
    .status-chip.confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-chip.completed { background: #e3f2fd; color: #1565c0; }
    .status-chip.cancelled { background: #e8f5e9; color: #c62828; }
    .phone { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
    .empty { text-align: center; padding: 48px; color: var(--text-muted); }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.3; display: block; margin: 0 auto 16px; }
    @media (max-width: 768px) { .schedule-layout { grid-template-columns: 1fr; } }
  `]
})
export class TechnicianScheduleComponent implements OnInit {
  selectedDate: Date = new Date();
  dayAppointments: Appointment[] = [];

  constructor(private apptService: AppointmentService) {}

  ngOnInit() { this.loadDay(this.selectedDate); }

  onDateSelect(date: Date) {
    this.selectedDate = date;
    this.loadDay(date);
  }

  loadDay(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    this.apptService.getAll({ date: dateStr }).subscribe(a => this.dayAppointments = a);
  }

  getService(a: Appointment): any { return (a.serviceId as any) || {}; }
}
