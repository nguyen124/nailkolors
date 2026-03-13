import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColorService } from '../../../services/color.service';
import { NailColor } from '../../../models';

const FINISH_TYPES = ['Shiny', 'Matte', 'Glitter', 'Cat Eyes', 'Holographic'];

@Component({
  selector: 'app-salon-owner-colors',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatCardModule, MatTooltipModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>My Color Inventory</h2>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Color
        </button>
      </div>

      <!-- Add / Edit form -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{editId ? 'Edit' : 'Add'}} Color</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="form-grid">
            <mat-form-field><mat-label>Color Name</mat-label><input matInput formControlName="colorName"></mat-form-field>
            <mat-form-field><mat-label>Brand</mat-label><input matInput formControlName="brand"></mat-form-field>
            <mat-form-field>
              <mat-label>Color Code (hex)</mat-label>
              <input matInput formControlName="colorCode" placeholder="#FF0000">
              <div matPrefix class="color-preview" [style.background]="form.get('colorCode')?.value"></div>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Finish Type</mat-label>
              <mat-select formControlName="finishType">
                <mat-option *ngFor="let f of finishTypes" [value]="f">{{f}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field><mat-label>Quantity</mat-label><input matInput formControlName="quantity" type="number" min="0"></mat-form-field>

            <div class="file-upload">
              <label>Color Photo</label>
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

      <!-- Table -->
      <mat-card>
        <table mat-table [dataSource]="colors" class="full-width">
          <ng-container matColumnDef="swatch">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let c">
              <div class="color-dot-cell" [style.background]="c.image ? 'url('+c.image+') center/cover' : c.colorCode"></div>
            </td>
          </ng-container>
          <ng-container matColumnDef="colorName">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c"><strong>{{c.colorName}}</strong></td>
          </ng-container>
          <ng-container matColumnDef="brand">
            <th mat-header-cell *matHeaderCellDef>Brand</th>
            <td mat-cell *matCellDef="let c">{{c.brand}}</td>
          </ng-container>
          <ng-container matColumnDef="finishType">
            <th mat-header-cell *matHeaderCellDef>Finish</th>
            <td mat-cell *matCellDef="let c"><span class="finish-badge">{{c.finishType}}</span></td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let c">{{c.quantity}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <span class="status-badge" [class.available]="c.status==='available'" [class.out]="c.status==='out-of-stock'">
                {{c.status === 'available' ? 'In Stock' : 'Out of Stock'}}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" (click)="edit(c)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(c._id)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p class="empty" *ngIf="colors.length === 0 && !loading">No colors yet. Add your first color!</p>
        <p class="empty" *ngIf="loading">Loading…</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; color: var(--primary-dark); }
    .form-card { margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 0; }
    .color-preview { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc; margin-right: 8px; flex-shrink: 0; }
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 80px; max-width: 120px; border-radius: 8px; object-fit: cover; }
    .color-dot-cell { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); }
    table { width: 100%; }
    .finish-badge { background: var(--bg-light, #e8f5e9); color: var(--primary-dark); font-size: 0.78rem; padding: 2px 8px; border-radius: 50px; }
    .status-badge { font-size: 0.78rem; padding: 3px 10px; border-radius: 50px; font-weight: 600; }
    .status-badge.available { background: #e8f5e9; color: #2e7d32; }
    .status-badge.out { background: #ffebee; color: #c62828; }
    .empty { text-align: center; padding: 32px; color: var(--text-muted, #757575); }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } mat-card { overflow-x: auto; } }
  `]
})
export class SalonOwnerColorsComponent implements OnInit {
  colors: NailColor[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  loading = false;
  columns = ['swatch', 'colorName', 'brand', 'finishType', 'quantity', 'status', 'actions'];
  finishTypes = FINISH_TYPES;

  constructor(private colorService: ColorService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      colorName: ['', Validators.required],
      brand:     ['', Validators.required],
      colorCode: ['#000000', Validators.required],
      finishType:['', Validators.required],
      quantity:  [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.colorService.getAll({ owner: 'me' }).subscribe({
      next: c => { this.colors = c; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm() {
    this.showForm = true;
    this.editId = '';
    this.form.reset({ colorCode: '#000000', quantity: 0 });
    this.imagePreview = '';
    this.imageFile = null;
  }

  edit(c: NailColor) {
    this.showForm = true;
    this.editId = c._id;
    this.form.patchValue({ colorName: c.colorName, brand: c.brand, colorCode: c.colorCode, finishType: c.finishType, quantity: c.quantity });
    this.imagePreview = c.image || '';
    this.imageFile = null;
  }

  cancelForm() { this.showForm = false; }

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
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, String(v)));
    if (this.imageFile) fd.append('image', this.imageFile);
    const req = this.editId ? this.colorService.update(this.editId, fd) : this.colorService.create(fd);
    req.subscribe({
      next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }

  delete(id: string) {
    if (!confirm('Delete this color?')) return;
    this.colorService.delete(id).subscribe({ next: () => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); } });
  }
}
