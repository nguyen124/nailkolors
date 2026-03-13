import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MySalonService } from '../../../services/my-salon.service';
import { WorkingHours } from '../../../models';

const SERVICE_CATEGORIES = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing'];

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { day: 'Monday',    isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Tuesday',   isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Wednesday', isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Thursday',  isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Friday',    isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Saturday',  isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Sunday',    isWorking: true, start: '11:30', end: '17:00' },
];

@Component({
  selector: 'app-salon-owner-technicians',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSnackBarModule, MatCardModule,
    MatChipsModule, MatSlideToggleModule, MatTooltipModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>My Technicians</h2>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Add Technician</button>
      </div>

      <!-- Add / Edit form -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{editId ? 'Edit' : 'Add'}} Technician</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="form-grid">
            <mat-form-field><mat-label>Full Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field><mat-label>Email</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
            <mat-form-field *ngIf="!editId"><mat-label>Password</mat-label><input matInput formControlName="password" type="password"></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Bio</mat-label><textarea matInput formControlName="bio" rows="3"></textarea></mat-form-field>

            <div class="specialties-section span-2">
              <label class="specialties-label">
                Specialties
                <span class="specialties-hint">Select service types this technician can perform</span>
              </label>
              <div class="specialties-grid">
                <mat-checkbox
                  *ngFor="let cat of serviceCategories"
                  [checked]="isSelected(cat)"
                  (change)="toggleSpecialty(cat, $event.checked)"
                  class="specialty-checkbox">
                  <span class="cat-label">{{cat}}</span>
                </mat-checkbox>
              </div>
              <p class="no-selection-warn" *ngIf="selectedSpecialties.length === 0">
                <mat-icon>info</mat-icon> Select at least one specialty.
              </p>
              <div class="selected-chips">
                <span class="chip-badge" *ngFor="let s of selectedSpecialties">{{s}}</span>
              </div>
            </div>

            <div class="file-upload">
              <label>Profile Photo</label>
              <input type="file" accept="image/*" (change)="onFile($event)">
              <img *ngIf="imagePreview" [src]="imagePreview" class="preview">
            </div>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
          <button mat-stroked-button (click)="cancelForm()">Cancel</button>
        </mat-card-actions>
      </mat-card>

      <!-- Working Schedule editor -->
      <mat-card *ngIf="scheduleFor" class="schedule-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>schedule</mat-icon>
            Working Schedule — {{scheduleFor.name}}
          </mat-card-title>
          <mat-card-subtitle>Set working hours for each day of the week</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="schedule-grid">
            <div class="schedule-header">
              <span>Day</span><span>Working</span><span>Start</span><span>End</span>
            </div>
            <div class="schedule-row" *ngFor="let row of editWorkingHours" [class.off-day]="!row.isWorking">
              <span class="day-label">{{row.day}}</span>
              <mat-slide-toggle [(ngModel)]="row.isWorking" color="primary"></mat-slide-toggle>
              <input type="time" [(ngModel)]="row.start" [disabled]="!row.isWorking" class="time-input" [class.disabled]="!row.isWorking">
              <input type="time" [(ngModel)]="row.end" [disabled]="!row.isWorking" class="time-input" [class.disabled]="!row.isWorking">
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="saveSchedule()">
            <mat-icon>save</mat-icon> Save Schedule
          </button>
          <button mat-stroked-button (click)="scheduleFor = null">Cancel</button>
        </mat-card-actions>
      </mat-card>

      <!-- Technicians table -->
      <mat-card>
        <table mat-table [dataSource]="technicians" class="full-width">
          <ng-container matColumnDef="photo">
            <th mat-header-cell *matHeaderCellDef>Photo</th>
            <td mat-cell *matCellDef="let t">
              <div class="tech-avatar" [style.background-image]="t.photo ? 'url(' + t.photo + ')' : ''">
                <span *ngIf="!t.photo">{{t.name?.charAt(0)}}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let t">{{t.name}}</td>
          </ng-container>
          <ng-container matColumnDef="specialties">
            <th mat-header-cell *matHeaderCellDef>Specialties</th>
            <td mat-cell *matCellDef="let t">
              <span class="badge-primary" *ngFor="let s of t.specialties">{{s}}</span>
              <span class="no-spec" *ngIf="!t.specialties?.length">—</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="schedule">
            <th mat-header-cell *matHeaderCellDef>Schedule</th>
            <td mat-cell *matCellDef="let t">
              <span class="working-days">{{getWorkingDays(t)}}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let t">
              <button mat-icon-button color="primary" (click)="edit(t)" matTooltip="Edit profile"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="accent" (click)="openSchedule(t)" matTooltip="Edit working hours"><mat-icon>schedule</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(t._id)" matTooltip="Remove"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p class="empty" *ngIf="technicians.length === 0 && !loading">No technicians yet.</p>
        <p class="empty" *ngIf="loading">Loading...</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; color: var(--primary-dark); }
    .form-card, .schedule-card { margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 0; }
    .span-2 { grid-column: 1 / -1; }
    .specialties-section { padding: 12px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
    .specialties-label { display: block; font-weight: 600; color: rgba(0,0,0,0.7); margin-bottom: 4px; }
    .specialties-hint { font-size: 0.8rem; color: var(--text-muted); font-weight: 400; margin-left: 8px; }
    .specialties-grid { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 12px 0; }
    .specialty-checkbox { min-width: 130px; }
    .cat-label { text-transform: capitalize; font-weight: 500; }
    .no-selection-warn { display: flex; align-items: center; gap: 6px; color: #e65100; font-size: 0.85rem; margin: 4px 0; }
    .no-selection-warn mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .selected-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .chip-badge { background: var(--primary, #4caf50); color: white; padding: 3px 12px; border-radius: 50px; font-size: 0.8rem; text-transform: capitalize; }
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 80px; border-radius: 50%; width: 80px; object-fit: cover; }
    .schedule-card mat-card-title { display: flex; align-items: center; gap: 8px; }
    .schedule-grid { display: flex; flex-direction: column; gap: 0; margin-top: 16px; }
    .schedule-header { display: grid; grid-template-columns: 130px 90px 120px 120px; gap: 12px; padding: 8px 12px; background: #fce4ec; border-radius: 8px 8px 0 0; font-weight: 600; font-size: 0.85rem; color: var(--primary-dark); }
    .schedule-row { display: grid; grid-template-columns: 130px 90px 120px 120px; gap: 12px; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f5f5f5; }
    .schedule-row.off-day { background: #fafafa; }
    .day-label { font-weight: 500; font-size: 0.95rem; }
    .time-input { border: 1px solid #ddd; border-radius: 6px; padding: 6px 10px; font-size: 0.9rem; width: 100px; outline: none; }
    .time-input:focus { border-color: var(--primary); }
    .time-input.disabled { opacity: 0.4; background: #f5f5f5; cursor: not-allowed; }
    .tech-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light, #a5d6a7), var(--primary, #4caf50)); background-size: cover; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
    table { width: 100%; }
    .badge-primary { background: #e8f5e9; color: var(--primary-dark, #1b5e20); font-size: 0.78rem; padding: 2px 8px; border-radius: 50px; margin-right: 4px; }
    .no-spec { color: #ccc; }
    .working-days { font-size: 0.82rem; color: #666; }
    .empty { text-align: center; padding: 32px; color: var(--text-muted, #757575); }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      mat-card { overflow-x: auto; }
      .form-grid { grid-template-columns: 1fr; }
      .schedule-header, .schedule-row { grid-template-columns: 110px 80px 100px 100px; gap: 8px; }
    }
  `]
})
export class SalonOwnerTechniciansComponent implements OnInit {
  technicians: any[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  loading = false;
  columns = ['photo', 'name', 'specialties', 'schedule', 'actions'];
  serviceCategories = SERVICE_CATEGORIES;
  selectedSpecialties: string[] = [];

  scheduleFor: any | null = null;
  editWorkingHours: WorkingHours[] = [];

  constructor(private mySalonService: MySalonService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      bio: ['']
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.mySalonService.getTechnicians().subscribe({
      next: t => { this.technicians = t; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm() {
    this.showForm = true;
    this.editId = '';
    this.scheduleFor = null;
    this.form.reset();
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
    this.selectedSpecialties = [];
    this.imagePreview = '';
    this.imageFile = null;
  }

  edit(t: any) {
    this.showForm = true;
    this.scheduleFor = null;
    this.editId = t._id;
    this.form.patchValue({ name: t.name, email: t.userId?.email || '', bio: t.bio, password: '' });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.selectedSpecialties = [...(t.specialties || [])];
    this.imagePreview = t.photo || '';
    this.imageFile = null;
  }

  cancelForm() { this.showForm = false; }

  openSchedule(t: any) {
    this.showForm = false;
    this.scheduleFor = t;
    const existing = t.workingHours?.length ? t.workingHours : [];
    this.editWorkingHours = DEFAULT_WORKING_HOURS.map(def => {
      const found = existing.find((h: WorkingHours) => h.day === def.day);
      return found ? { ...found } : { ...def };
    });
  }

  saveSchedule() {
    if (!this.scheduleFor) return;
    const payload = new FormData();
    payload.append('workingHours', JSON.stringify(this.editWorkingHours));
    this.mySalonService.updateTechnician(this.scheduleFor._id, payload).subscribe({
      next: () => {
        this.snackBar.open('Schedule saved!', 'OK', { duration: 2000 });
        this.load();
        this.scheduleFor = null;
      },
      error: e => this.snackBar.open(e.error?.message || 'Error saving schedule', 'OK', { duration: 3000 })
    });
  }

  getWorkingDays(t: any): string {
    if (!t.workingHours?.length) return 'Not set';
    const days = t.workingHours.filter((h: WorkingHours) => h.isWorking).map((h: WorkingHours) => h.day.substring(0, 3));
    return days.length ? days.join(', ') : 'Off all week';
  }

  isSelected(cat: string): boolean { return this.selectedSpecialties.includes(cat); }

  toggleSpecialty(cat: string, checked: boolean) {
    if (checked) {
      if (!this.selectedSpecialties.includes(cat)) this.selectedSpecialties.push(cat);
    } else {
      this.selectedSpecialties = this.selectedSpecialties.filter(s => s !== cat);
    }
  }

  onFile(e: any) {
    this.imageFile = e.target.files[0];
    if (this.imageFile) {
      const r = new FileReader();
      r.onload = ev => this.imagePreview = ev.target?.result as string;
      r.readAsDataURL(this.imageFile);
    }
  }

  save() {
    if (this.form.invalid) return;
    const fd = new FormData();
    const vals = this.form.value;
    Object.entries(vals).forEach(([k, v]) => { if (v) fd.append(k, v as string); });
    fd.append('specialties', JSON.stringify(this.selectedSpecialties));
    if (this.imageFile) fd.append('photo', this.imageFile);
    const req = this.editId
      ? this.mySalonService.updateTechnician(this.editId, fd)
      : this.mySalonService.createTechnician(fd);
    req.subscribe({
      next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }

  delete(id: string) {
    if (!confirm('Remove this technician? This will permanently delete their account.')) return;
    this.mySalonService.deleteTechnician(id).subscribe({
      next: () => { this.snackBar.open('Removed', 'OK', { duration: 2000 }); this.load(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }
}
