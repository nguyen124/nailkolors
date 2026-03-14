import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatCardModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Services Management</h2>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Add Service</button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header><mat-card-title>{{editId ? 'Edit' : 'Add'}} Service</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
            <mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field><mat-label>Price ($)</mat-label><input matInput formControlName="price" type="number"></mat-form-field>
            <mat-form-field><mat-label>Duration (min)</mat-label><input matInput formControlName="duration" type="number"></mat-form-field>
            <mat-form-field>
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option *ngFor="let c of categories" [value]="c">{{c}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field><mat-label>Sort Order</mat-label><input matInput formControlName="sortOrder" type="number"></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
            <div class="span-2 file-upload">
              <label>Service Image</label>
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
        <table mat-table [dataSource]="services" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let s">{{s.name}}</td>
          </ng-container>
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let s"><span class="badge badge-primary">{{s.category}}</span></td>
          </ng-container>
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let s">\${{s.price}}</td>
          </ng-container>
          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duration</th>
            <td mat-cell *matCellDef="let s">{{s.duration}} min</td>
          </ng-container>
          <ng-container matColumnDef="sortOrder">
            <th mat-header-cell *matHeaderCellDef>Order</th>
            <td mat-cell *matCellDef="let s">{{s.sortOrder}}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let s">
              <button mat-icon-button color="primary" (click)="edit(s)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(s._id)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; color: var(--primary-dark); }
    .form-card { margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 0; }
    .span-2 { grid-column: 1 / -1; }
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 100px; max-width: 100%; width: auto; border-radius: 8px; object-fit: contain; }
    table { width: 100%; }
    @media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; gap: 12px; } mat-card { overflow-x: auto; } .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminServicesComponent implements OnInit {
  services: Service[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  categories = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing', 'Kid Service'];
  columns = ['sortOrder', 'name', 'category', 'price', 'duration', 'actions'];

  constructor(private serviceService: ServiceService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({ name: ['', Validators.required], price: [0, Validators.required], duration: [60, Validators.required], category: ['Manicure', Validators.required], description: [''], sortOrder: [9999] });
  }

  ngOnInit() { this.load(); }
  load() { this.serviceService.getAll().subscribe(s => this.services = s); }

  openForm() { this.showForm = true; this.editId = ''; this.form.reset({ category: 'Manicure', price: 0, duration: 60 }); this.imagePreview = ''; }
  edit(s: Service) { this.showForm = true; this.editId = s._id; this.form.patchValue(s); this.imagePreview = s.image || ''; }
  cancelForm() { this.showForm = false; }

  onFile(e: any) {
    this.imageFile = e.target.files[0];
    if (this.imageFile) { const r = new FileReader(); r.onload = ev => this.imagePreview = ev.target?.result as string; r.readAsDataURL(this.imageFile); }
  }

  save() {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, v as string));
    if (this.imageFile) fd.append('image', this.imageFile);
    const req = this.editId ? this.serviceService.update(this.editId, fd) : this.serviceService.create(fd);
    req.subscribe({ next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); }, error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }

  delete(id: string) {
    if (!confirm('Delete this service?')) return;
    this.serviceService.delete(id).subscribe({ next: () => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); }, error: e => this.snackBar.open('Error', 'OK', { duration: 3000 }) });
  }
}
