import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TechnicianService } from '../../../services/technician.service';
import { Technician } from '../../../models';

// These must match service categories exactly so the booking filter works
const SERVICE_CATEGORIES = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing'];

@Component({
  selector: 'app-admin-technicians',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSnackBarModule, MatCardModule, MatChipsModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Technician Management</h2>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Add Technician</button>
      </div>

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

            <!-- Specialties: checkboxes mapped to service categories -->
            <div class="specialties-section span-2">
              <label class="specialties-label">
                Specialties
                <span class="specialties-hint">Select the service types this technician can perform</span>
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
                <mat-icon>info</mat-icon> Select at least one specialty so customers can find this technician.
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
              <span class="badge badge-primary" *ngFor="let s of t.specialties">{{s}}</span>
              <span class="no-spec" *ngIf="!t.specialties?.length">—</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let t">
              <button mat-icon-button color="primary" (click)="edit(t)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(t._id)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; color: var(--primary-dark); }
    .form-card { margin-bottom: 24px; }
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
    .chip-badge { background: var(--primary); color: white; padding: 3px 12px; border-radius: 50px; font-size: 0.8rem; text-transform: capitalize; }
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 80px; border-radius: 50%; width: 80px; object-fit: cover; }
    .tech-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); background-size: cover; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
    table { width: 100%; }
    .badge-primary { background: #e8f5e9; color: var(--primary); font-size: 0.78rem; padding: 2px 8px; border-radius: 50px; margin-right: 4px; text-transform: capitalize; }
    .no-spec { color: #ccc; }
    @media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; gap: 12px; } mat-card { overflow-x: auto; } .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminTechniciansComponent implements OnInit {
  technicians: Technician[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  columns = ['photo', 'name', 'specialties', 'actions'];
  serviceCategories = SERVICE_CATEGORIES;
  selectedSpecialties: string[] = [];

  constructor(private techService: TechnicianService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      bio: ['']
    });
  }

  ngOnInit() { this.load(); }

  load() { this.techService.getAll().subscribe(t => this.technicians = t); }

  openForm() {
    this.showForm = true;
    this.editId = '';
    this.form.reset();
    this.selectedSpecialties = [];
    this.imagePreview = '';
  }

  edit(t: Technician) {
    this.showForm = true;
    this.editId = t._id;
    this.form.patchValue({ name: t.name, email: (t as any).userId?.email || '', bio: t.bio });
    this.selectedSpecialties = [...(t.specialties || [])];
    this.imagePreview = t.photo || '';
  }

  cancelForm() { this.showForm = false; }

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
    const req = this.editId ? this.techService.update(this.editId, fd) : this.techService.create(fd);
    req.subscribe({
      next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }

  delete(id: string) {
    if (!confirm('Remove this technician?')) return;
    this.techService.delete(id).subscribe({ next: () => { this.snackBar.open('Removed', 'OK', { duration: 2000 }); this.load(); } });
  }
}
