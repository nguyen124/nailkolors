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
import { ColorService } from '../../../services/color.service';
import { NailColor } from '../../../models';

@Component({
  selector: 'app-admin-colors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatCardModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Nail Color Inventory</h2>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Add Color</button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header><mat-card-title>{{editId ? 'Edit' : 'Add'}} Nail Color</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="form-grid">
            <mat-form-field><mat-label>Color Name</mat-label><input matInput formControlName="colorName"></mat-form-field>
            <mat-form-field><mat-label>Brand</mat-label><input matInput formControlName="brand"></mat-form-field>
            <mat-form-field><mat-label>Color Code (hex)</mat-label><input matInput formControlName="colorCode" type="color"></mat-form-field>
            <mat-form-field>
              <mat-label>Finish Type</mat-label>
              <mat-select formControlName="finishType">
                <mat-option *ngFor="let f of finishes" [value]="f">{{f}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field><mat-label>Quantity</mat-label><input matInput formControlName="quantity" type="number"></mat-form-field>
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

      <mat-card>
        <table mat-table [dataSource]="colors" class="full-width">
          <ng-container matColumnDef="color">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let c">
              <div style="display:flex;align-items:center;gap:8px">
                <div class="swatch" [style.background]="c.colorCode"></div>
                <span>{{c.colorName}}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="brand">
            <th mat-header-cell *matHeaderCellDef>Brand</th>
            <td mat-cell *matCellDef="let c">{{c.brand}}</td>
          </ng-container>
          <ng-container matColumnDef="finish">
            <th mat-header-cell *matHeaderCellDef>Finish</th>
            <td mat-cell *matCellDef="let c"><span class="badge badge-primary">{{c.finishType}}</span></td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let c">{{c.quantity}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <span class="badge" [class.badge-success]="c.status==='available'" [class.badge-danger]="c.status==='out-of-stock'">{{c.status}}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" (click)="edit(c)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(c._id)"><mat-icon>delete</mat-icon></button>
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
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 80px; border-radius: 8px; }
    .swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); }
    table { width: 100%; }
    @media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; gap: 12px; } mat-card { overflow-x: auto; } .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminColorsComponent implements OnInit {
  colors: NailColor[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  finishes = ['Shiny', 'Matte', 'Glitter', 'Cat Eyes', 'Holographic'];
  columns = ['color', 'brand', 'finish', 'quantity', 'status', 'actions'];

  constructor(private colorService: ColorService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({ colorName: ['', Validators.required], brand: ['', Validators.required], colorCode: ['#ff69b4', Validators.required], finishType: ['Shiny', Validators.required], quantity: [0] });
  }

  ngOnInit() { this.load(); }
  load() { this.colorService.getAll().subscribe(c => this.colors = c); }
  openForm() { this.showForm = true; this.editId = ''; this.form.reset({ finishType: 'Shiny', colorCode: '#ff69b4', quantity: 0 }); this.imagePreview = ''; }
  edit(c: NailColor) { this.showForm = true; this.editId = c._id; this.form.patchValue(c); this.imagePreview = c.image || ''; }
  cancelForm() { this.showForm = false; }
  onFile(e: any) { this.imageFile = e.target.files[0]; if (this.imageFile) { const r = new FileReader(); r.onload = ev => this.imagePreview = ev.target?.result as string; r.readAsDataURL(this.imageFile); } }

  save() {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, v as string));
    if (this.imageFile) fd.append('image', this.imageFile);
    const req = this.editId ? this.colorService.update(this.editId, fd) : this.colorService.create(fd);
    req.subscribe({ next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); }, error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 }) });
  }

  delete(id: string) {
    if (!confirm('Delete this color?')) return;
    this.colorService.delete(id).subscribe({ next: () => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); } });
  }
}
