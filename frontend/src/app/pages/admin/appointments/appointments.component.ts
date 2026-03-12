import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { AppointmentService } from '../../../services/appointment.service';
import { TechnicianService } from '../../../services/technician.service';
import { Appointment, Technician, Service } from '../../../models';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, MatCardModule],
  template: `
    <div class="admin-page">
      <div class="page-header"><h2>Appointment Management</h2></div>
      <mat-card class="filter-card">
        <form [formGroup]="filterForm" class="filter-grid">
          <mat-form-field>
            <mat-label>Filter by Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Technician</mat-label>
            <mat-select formControlName="technicianId">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let t of technicians" [value]="t._id">{{t.name}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="">All</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="confirmed">Confirmed</mat-option>
              <mat-option value="completed">Completed</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="load()">Filter</button>
          <button mat-stroked-button (click)="resetFilter()">Reset</button>
        </form>
      </mat-card>

      <mat-card>
        <table mat-table [dataSource]="appointments" class="full-width">
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let a">
              <div><strong>{{a.customerName}}</strong></div>
              <div style="font-size:0.8rem;color:var(--text-muted)">{{a.customerPhone}}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="service">
            <th mat-header-cell *matHeaderCellDef>Service</th>
            <td mat-cell *matCellDef="let a">{{getService(a).name}}</td>
          </ng-container>
          <ng-container matColumnDef="technician">
            <th mat-header-cell *matHeaderCellDef>Technician</th>
            <td mat-cell *matCellDef="let a">{{getTech(a).name}}</td>
          </ng-container>
          <ng-container matColumnDef="datetime">
            <th mat-header-cell *matHeaderCellDef>Date & Time</th>
            <td mat-cell *matCellDef="let a">{{a.date | date:'mediumDate'}} {{a.time}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let a">
              <mat-select [value]="a.status" (selectionChange)="updateStatus(a, $event.value)" class="status-select">
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="confirmed">Confirmed</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let a">
              <button mat-icon-button color="warn" (click)="delete(a._id)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p *ngIf="appointments.length===0" class="empty-msg">No appointments found.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; color: var(--primary-dark); }
    .filter-card { margin-bottom: 24px; }
    .filter-grid { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 8px 0; }
    .status-select { font-size: 0.85rem; }
    table { width: 100%; }
    .empty-msg { text-align: center; color: var(--text-muted); padding: 32px; }
    @media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; gap: 12px; } mat-card { overflow-x: auto; } }
  `]
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  technicians: Technician[] = [];
  filterForm: FormGroup;
  columns = ['customer', 'service', 'technician', 'datetime', 'status', 'actions'];

  constructor(private apptService: AppointmentService, private techService: TechnicianService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.filterForm = this.fb.group({ date: [''], technicianId: [''], status: [''] });
  }

  ngOnInit() { this.techService.getAll().subscribe(t => this.technicians = t); this.load(); }

  load() {
    const params: any = {};
    const { date, technicianId, status } = this.filterForm.value;
    if (date) params['date'] = new Date(date).toISOString().split('T')[0];
    if (technicianId) params['technicianId'] = technicianId;
    if (status) params['status'] = status;
    this.apptService.getAll(params).subscribe(a => this.appointments = a);
  }

  resetFilter() { this.filterForm.reset(); this.load(); }
  getService(a: Appointment): any { return (a.serviceId as any) || {}; }
  getTech(a: Appointment): any { return (a.technicianId as any) || {}; }

  updateStatus(a: Appointment, status: string) {
    this.apptService.update(a._id, { status: status as any }).subscribe({
      next: () => { a.status = status as any; this.snackBar.open('Status updated', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Error updating status', 'OK', { duration: 3000 })
    });
  }

  delete(id: string) {
    if (!confirm('Delete this appointment?')) return;
    this.apptService.delete(id).subscribe({ next: () => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); } });
  }
}
