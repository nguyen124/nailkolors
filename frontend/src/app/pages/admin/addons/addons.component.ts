import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddOnService, AddOn } from '../../../services/addon.service';

const CATEGORIES = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing', 'Kid Service'];

@Component({
  selector: 'app-admin-addons',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h2>Add-Ons Management</h2>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> New Add-On
      </button>
    </div>

    <!-- Form panel -->
    <div class="form-panel card" *ngIf="showForm">
      <h3>{{editing ? 'Edit Add-On' : 'New Add-On'}}</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Name *</label>
          <input [(ngModel)]="form.name" placeholder="e.g. Gel Color, French Tip" />
        </div>
        <div class="form-group">
          <label>Price ($) *</label>
          <input type="number" [(ngModel)]="form.price" placeholder="0" min="0" />
        </div>
        <div class="form-group full">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="2" placeholder="Short description of this add-on"></textarea>
        </div>
        <div class="form-group full">
          <label>Applicable Categories <span class="hint">(leave all unchecked = applies to ALL services)</span></label>
          <div class="category-checks">
            <label class="check-item" *ngFor="let cat of categories">
              <input type="checkbox" [checked]="form.applicableCategories.includes(cat)" (change)="toggleCategory(cat)" />
              {{cat}}
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Sort Order</label>
          <input type="number" [(ngModel)]="form.sortOrder" placeholder="0" />
        </div>
        <div class="form-group toggle-row">
          <label>Active</label>
          <input type="checkbox" [(ngModel)]="form.isActive" />
        </div>
      </div>
      <div class="form-actions">
        <button mat-button (click)="cancelForm()">Cancel</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="saving">
          {{saving ? 'Saving…' : (editing ? 'Update' : 'Create')}}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <table class="data-table" *ngIf="addons.length > 0; else empty">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Applies To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of addons; let i = index" [class.inactive-row]="!a.isActive">
            <td>{{i + 1}}</td>
            <td><strong>{{a.name}}</strong></td>
            <td class="price-cell">+\${{a.price}}</td>
            <td class="desc-cell">{{a.description || '—'}}</td>
            <td>
              <span *ngIf="a.applicableCategories.length === 0" class="tag tag-all">All Services</span>
              <span *ngFor="let cat of a.applicableCategories" class="tag">{{cat}}</span>
            </td>
            <td><span class="status-badge" [class.active]="a.isActive">{{a.isActive ? 'Active' : 'Inactive'}}</span></td>
            <td class="actions-cell">
              <button mat-icon-button (click)="openForm(a)" title="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="remove(a)" title="Delete"><mat-icon>delete</mat-icon></button>
            </td>
          </tr>
        </tbody>
      </table>
      <ng-template #empty>
        <div class="empty-state">
          <mat-icon>extension</mat-icon>
          <p>No add-ons yet. Click "New Add-On" to create one.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-family: 'Playfair Display', serif; }
    .form-panel { padding: 24px; margin-bottom: 24px; }
    .form-panel h3 { margin: 0 0 20px; font-family: 'Playfair Display', serif; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group.toggle-row { flex-direction: row; align-items: center; gap: 12px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .form-group input[type=text], .form-group input[type=number], .form-group textarea {
      padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; font-family: inherit;
    }
    .form-group textarea { resize: vertical; }
    .hint { font-weight: 400; font-style: italic; color: #aaa; font-size: 0.8rem; }
    .category-checks { display: flex; flex-wrap: wrap; gap: 10px 24px; margin-top: 4px; }
    .check-item { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .table-card { padding: 0; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8f8f8; padding: 12px 16px; text-align: left; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 2px solid #eee; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .inactive-row { opacity: 0.55; }
    .price-cell { font-weight: 700; color: var(--primary); }
    .desc-cell { font-size: 0.85rem; color: var(--text-muted); max-width: 220px; }
    .tag { display: inline-block; background: #f0f0f0; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; margin: 2px; }
    .tag-all { background: #e8f5e9; color: #388e3c; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; background: #f5f5f5; color: #999; }
    .status-badge.active { background: #e8f5e9; color: #388e3c; }
    .actions-cell { white-space: nowrap; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.3; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminAddOnsComponent implements OnInit {
  addons: AddOn[] = [];
  categories = CATEGORIES;
  showForm = false;
  editing: AddOn | null = null;
  saving = false;
  form = this.blankForm();

  constructor(private addOnService: AddOnService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.addOnService.getAllAdmin().subscribe(a => this.addons = a);
  }

  blankForm() {
    return { name: '', price: 0, description: '', applicableCategories: [] as string[], isActive: true, sortOrder: 0 };
  }

  openForm(addon?: AddOn) {
    this.editing = addon || null;
    this.form = addon
      ? { name: addon.name, price: addon.price, description: addon.description, applicableCategories: [...addon.applicableCategories], isActive: addon.isActive, sortOrder: addon.sortOrder }
      : this.blankForm();
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() { this.showForm = false; this.editing = null; }

  toggleCategory(cat: string) {
    const idx = this.form.applicableCategories.indexOf(cat);
    if (idx >= 0) this.form.applicableCategories.splice(idx, 1);
    else this.form.applicableCategories.push(cat);
  }

  save() {
    if (!this.form.name.trim()) { this.snackBar.open('Name is required', '', { duration: 2000 }); return; }
    this.saving = true;
    const obs = this.editing
      ? this.addOnService.update(this.editing._id, this.form)
      : this.addOnService.create(this.form);
    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editing ? 'Add-on updated' : 'Add-on created', '', { duration: 2000 });
        this.cancelForm();
        this.load();
        this.saving = false;
      },
      error: () => { this.snackBar.open('Error saving add-on', '', { duration: 2000 }); this.saving = false; }
    });
  }

  remove(addon: AddOn) {
    if (!confirm(`Delete "${addon.name}"?`)) return;
    this.addOnService.delete(addon._id).subscribe({
      next: () => { this.snackBar.open('Deleted', '', { duration: 2000 }); this.load(); },
      error: () => this.snackBar.open('Error deleting', '', { duration: 2000 })
    });
  }
}
