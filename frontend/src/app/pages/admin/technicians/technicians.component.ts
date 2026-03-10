import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TechnicianService } from '../../../services/technician.service';
import { Technician } from '../../../models';

@Component({
  selector: 'app-admin-technicians',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatCardModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Technician Management</h2>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Add Technician</button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header><mat-card-title>{{editId ? 'Edit' : 'Add'}} Technician</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="form-grid">
            <mat-form-field><mat-label>Full Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field><mat-label>Email</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
            <mat-form-field *ngIf="!editId"><mat-label>Password</mat-label><input matInput formControlName="password" type="password"></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Bio</mat-label><textarea matInput formControlName="bio" rows="3"></textarea></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Specialties (comma separated)</mat-label><input matInput formControlName="specialtiesStr"></mat-form-field>
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
              <span class="badge badge-primary" *ngFor="let s of t.specialties" style="margin-right:4px">{{s}}</span>
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
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 80px; border-radius: 50%; width: 80px; object-fit: cover; }
    .tech-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); background-size: cover; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
    table { width: 100%; }
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

  constructor(private techService: TechnicianService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: [''], bio: [''], specialtiesStr: [''] });
  }

  ngOnInit() { this.load(); }
  load() { this.techService.getAll().subscribe(t => this.technicians = t); }
  openForm() { this.showForm = true; this.editId = ''; this.form.reset(); this.imagePreview = ''; }
  edit(t: Technician) { this.showForm = true; this.editId = t._id; this.form.patchValue({ ...t, specialtiesStr: t.specialties.join(', ') }); this.imagePreview = t.photo || ''; }
  cancelForm() { this.showForm = false; }
  onFile(e: any) { this.imageFile = e.target.files[0]; if (this.imageFile) { const r = new FileReader(); r.onload = ev => this.imagePreview = ev.target?.result as string; r.readAsDataURL(this.imageFile); } }

  save() {
    if (this.form.invalid) return;
    const { specialtiesStr, ...vals } = this.form.value;
    const specialties = specialtiesStr ? specialtiesStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => { if (v) fd.append(k, v as string); });
    fd.append('specialties', JSON.stringify(specialties));
    if (this.imageFile) fd.append('photo', this.imageFile);
    const req = this.editId ? this.techService.update(this.editId, fd) : this.techService.create(fd);
    req.subscribe({ next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); }, error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }

  delete(id: string) {
    if (!confirm('Remove this technician?')) return;
    this.techService.delete(id).subscribe({ next: () => { this.snackBar.open('Removed', 'OK', { duration: 2000 }); this.load(); } });
  }
}
