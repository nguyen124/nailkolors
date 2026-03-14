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

            <!-- Color code: native picker wheel + live swatch + editable hex text -->
            <div class="color-code-section">
              <div class="cc-label">Color Code</div>
              <div class="cc-row">
                <input type="color"
                  [value]="form.get('colorCode')?.value"
                  (input)="form.patchValue({ colorCode: $any($event.target).value })"
                  class="color-wheel"
                  title="Open color picker">
                <div class="cc-swatch" [style.background]="form.get('colorCode')?.value"></div>
                <input type="text" class="cc-hex-input"
                  formControlName="colorCode"
                  maxlength="7"
                  placeholder="#ff69b4"
                  spellcheck="false">
              </div>
            </div>

            <mat-form-field>
              <mat-label>Finish Type</mat-label>
              <mat-select formControlName="finishType">
                <mat-option *ngFor="let f of finishes" [value]="f">{{f}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field><mat-label>Quantity</mat-label><input matInput formControlName="quantity" type="number"></mat-form-field>

            <div class="file-upload">
              <div class="file-label-row">
                <label>Color Photo</label>
                <span class="pick-hint" *ngIf="canPickColor">
                  <mat-icon>colorize</mat-icon> Click image to pick color
                </span>
              </div>
              <div class="upload-buttons">
                <label class="upload-btn">
                  <mat-icon>photo_library</mat-icon> Choose File
                  <input type="file" accept="image/*" (change)="onFile($event)" hidden>
                </label>
                <label class="upload-btn camera-btn">
                  <mat-icon>photo_camera</mat-icon> Take Photo
                  <input type="file" accept="image/*" capture="environment" (change)="onFile($event)" hidden>
                </label>
              </div>
              <div class="img-pick-wrap" *ngIf="imagePreview">
                <img [src]="imagePreview" class="preview"
                  [class.pick-cursor]="canPickColor"
                  (click)="pickColorFromImage($event)"
                  #previewImg>
                <div class="picked-indicator" *ngIf="lastPickedColor">
                  <div class="picked-swatch" [style.background]="lastPickedColor"></div>
                  <span>Picked: <strong>{{lastPickedColor.toUpperCase()}}</strong></span>
                </div>
              </div>
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
              <div class="table-color-cell">
                <div class="swatch" [style.background]="c.colorCode"></div>
                <div>
                  <div class="color-cell-name">{{c.colorName}}</div>
                  <div class="color-cell-hex">{{c.colorCode?.toUpperCase()}}</div>
                </div>
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

    /* Color code picker */
    .color-code-section { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .cc-label { font-size: 0.85rem; color: rgba(0,0,0,0.6); font-weight: 500; }
    .cc-row { display: flex; align-items: center; gap: 10px; }
    .color-wheel { width: 40px; height: 40px; border: none; border-radius: 8px; padding: 2px; cursor: pointer; background: none; flex-shrink: 0; }
    .color-wheel::-webkit-color-swatch-wrapper { padding: 0; border-radius: 6px; }
    .color-wheel::-webkit-color-swatch { border: none; border-radius: 6px; }
    .cc-swatch { width: 36px; height: 36px; border-radius: 8px; border: 2px solid rgba(0,0,0,0.12); flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .cc-hex-input { flex: 1; border: 2px solid #e0e0e0; border-radius: 8px; padding: 8px 12px; font-size: 0.9rem; font-family: 'Courier New', monospace; font-weight: 600; letter-spacing: 1px; outline: none; text-transform: uppercase; transition: border-color 0.2s; }
    .cc-hex-input:focus { border-color: var(--primary); }

    /* Image file upload + color picker */
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .upload-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
    .upload-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 2px solid var(--primary); border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: var(--primary); cursor: pointer; transition: background 0.2s, color 0.2s; }
    .upload-btn:hover { background: var(--primary); color: white; }
    .upload-btn mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .camera-btn { border-color: #e91e8c; color: #e91e8c; }
    .camera-btn:hover { background: #e91e8c; color: white; }
    .file-label-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .file-label-row label { font-size: 0.85rem; color: rgba(0,0,0,0.6); font-weight: 500; }
    .pick-hint { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--primary); font-weight: 600; background: #e8f5e9; padding: 2px 8px; border-radius: 50px; }
    .pick-hint mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .img-pick-wrap { position: relative; display: inline-block; }
    .preview { max-height: 160px; max-width: 100%; width: auto; border-radius: 8px; object-fit: contain; display: block; border: 1px solid #e0e0e0; }
    .pick-cursor { cursor: crosshair; }
    .pick-cursor:hover { outline: 2px solid var(--primary); }
    .picked-indicator { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 6px 10px; background: #f5f5f5; border-radius: 8px; font-size: 0.82rem; }
    .picked-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }

    /* Table */
    .table-color-cell { display: flex; align-items: center; gap: 10px; }
    .swatch { width: 32px; height: 32px; border-radius: 8px; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .color-cell-name { font-weight: 600; font-size: 0.9rem; }
    .color-cell-hex { font-size: 0.75rem; color: var(--text-muted); font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
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
  lastPickedColor = '';
  // Off-screen canvas for pixel sampling — only set when a fresh file is uploaded (data URL)
  private imageCanvas: HTMLCanvasElement | null = null;

  finishes = ['Shiny', 'Matte', 'Glitter', 'Cat Eyes', 'Holographic'];
  columns = ['color', 'brand', 'finish', 'quantity', 'status', 'actions'];

  get canPickColor(): boolean { return this.imagePreview.startsWith('data:'); }

  constructor(private colorService: ColorService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      colorName: ['', Validators.required],
      brand: ['', Validators.required],
      colorCode: ['#ff69b4', Validators.required],
      finishType: ['Shiny', Validators.required],
      quantity: [0]
    });
  }

  ngOnInit() { this.load(); }
  load() { this.colorService.getAll().subscribe(c => this.colors = c); }

  openForm() {
    this.showForm = true;
    this.editId = '';
    this.form.reset({ finishType: 'Shiny', colorCode: '#ff69b4', quantity: 0 });
    this.imagePreview = '';
    this.imageCanvas = null;
    this.lastPickedColor = '';
  }

  edit(c: NailColor) {
    this.showForm = true;
    this.editId = c._id;
    this.form.patchValue(c);
    this.imagePreview = c.image || '';
    this.imageCanvas = null;
    this.lastPickedColor = '';
  }

  cancelForm() { this.showForm = false; }

  onFile(e: any) {
    this.imageFile = e.target.files[0];
    if (!this.imageFile) return;
    const r = new FileReader();
    r.onload = ev => {
      this.imagePreview = ev.target?.result as string;
      this.lastPickedColor = '';
      this.loadImageToCanvas(this.imagePreview);
    };
    r.readAsDataURL(this.imageFile);
  }

  private loadImageToCanvas(src: string) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      this.imageCanvas = canvas;
    };
    img.src = src;
  }

  pickColorFromImage(event: MouseEvent) {
    if (!this.imageCanvas) return;
    const imgEl = event.target as HTMLImageElement;
    const rect = imgEl.getBoundingClientRect();
    const scaleX = this.imageCanvas.width / rect.width;
    const scaleY = this.imageCanvas.height / rect.height;
    const x = Math.max(0, Math.floor((event.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.floor((event.clientY - rect.top) * scaleY));
    const pixel = this.imageCanvas.getContext('2d')!.getImageData(x, y, 1, 1).data;
    const hex = '#' + [pixel[0], pixel[1], pixel[2]]
      .map(v => v.toString(16).padStart(2, '0')).join('');
    this.lastPickedColor = hex;
    this.form.patchValue({ colorCode: hex });
  }

  save() {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, v as string));
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
