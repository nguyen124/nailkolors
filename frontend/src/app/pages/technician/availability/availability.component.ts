import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TechnicianService } from '../../../services/technician.service';
import { Technician } from '../../../models';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-technician-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="availability">
      <h2 class="page-title">Manage Availability</h2>
      <div class="avail-grid" *ngIf="profile">
        <mat-card>
          <mat-card-header><mat-card-title>Working Hours</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="hoursForm">
              <div class="day-row" *ngFor="let ctrl of daysArray.controls; let i = index" [formGroup]="$any(ctrl)">
                <span class="day-name">{{days[i]}}</span>
                <mat-slide-toggle formControlName="isWorking" color="primary"></mat-slide-toggle>
                <ng-container *ngIf="ctrl.get('isWorking')?.value">
                  <mat-form-field class="time-field"><mat-label>Start</mat-label><input matInput formControlName="start" type="time"></mat-form-field>
                  <mat-form-field class="time-field"><mat-label>End</mat-label><input matInput formControlName="end" type="time"></mat-form-field>
                </ng-container>
                <span class="day-off" *ngIf="!ctrl.get('isWorking')?.value">Day off</span>
              </div>
            </form>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="saveHours()">Save Working Hours</button>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Blocked Dates</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-calendar [(selected)]="blockDate" [minDate]="today"></mat-calendar>
            <button mat-stroked-button color="primary" (click)="addBlockedDate()" style="margin-top:16px;width:100%">Block This Date</button>
            <div class="blocked-list">
              <div class="blocked-chip" *ngFor="let d of blockedDates">
                <span>{{d | date:'mediumDate'}}</span>
                <button mat-icon-button (click)="removeBlocked(d)"><mat-icon>close</mat-icon></button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 1.8rem; margin-bottom: 24px; color: var(--primary-dark); }
    .avail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .day-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; }
    .day-name { width: 90px; font-weight: 600; }
    .time-field { width: 100px; }
    .day-off { color: var(--text-muted); font-size: 0.85rem; }
    .blocked-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .blocked-chip { display: flex; align-items: center; justify-content: space-between; background: #e8f5e9; border-radius: 8px; padding: 4px 12px; }
    @media (max-width: 900px) { .avail-grid { grid-template-columns: 1fr; } }
  `]
})
export class TechnicianAvailabilityComponent implements OnInit {
  profile: Technician | null = null;
  hoursForm: FormGroup;
  days = DAYS;
  blockDate: Date = new Date();
  blockedDates: Date[] = [];
  today = new Date();

  get daysArray() { return this.hoursForm.get('days') as FormArray; }

  constructor(private techService: TechnicianService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.hoursForm = this.fb.group({ days: this.fb.array(DAYS.map(day => this.fb.group({ day, isWorking: [true], start: ['09:00'], end: ['18:00'] }))) });
  }

  ngOnInit() {
    this.techService.getMyProfile().subscribe(t => {
      this.profile = t;
      this.blockedDates = (t.blockedDates || []).map(d => new Date(d));
      if (t.workingHours?.length) {
        t.workingHours.forEach((wh, i) => {
          const ctrl = this.daysArray.at(i);
          if (ctrl) ctrl.patchValue(wh);
        });
      }
    });
  }

  saveHours() {
    if (!this.profile) return;
    const workingHours = this.daysArray.value;
    this.techService.update(this.profile._id, { workingHours: JSON.stringify(workingHours) } as any).subscribe({
      next: () => this.snackBar.open('Working hours saved!', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Error saving', 'OK', { duration: 3000 })
    });
  }

  addBlockedDate() {
    if (!this.profile || !this.blockDate) return;
    const dateStr = this.blockDate.toISOString().split('T')[0];
    const already = this.blockedDates.some(d => d.toISOString().split('T')[0] === dateStr);
    if (already) { this.snackBar.open('Date already blocked', 'OK', { duration: 2000 }); return; }
    this.blockedDates.push(new Date(this.blockDate));
    const blockedDates = JSON.stringify(this.blockedDates.map(d => d.toISOString()));
    this.techService.update(this.profile._id, { blockedDates } as any).subscribe({
      next: () => this.snackBar.open('Date blocked!', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Error', 'OK', { duration: 3000 })
    });
  }

  removeBlocked(date: Date) {
    if (!this.profile) return;
    this.blockedDates = this.blockedDates.filter(d => d.toISOString() !== date.toISOString());
    const blockedDates = JSON.stringify(this.blockedDates.map(d => d.toISOString()));
    this.techService.update(this.profile._id, { blockedDates } as any).subscribe({
      next: () => this.snackBar.open('Date unblocked', 'OK', { duration: 2000 })
    });
  }
}
