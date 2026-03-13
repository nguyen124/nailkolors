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
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SalonOwner } from '../../../models';

@Component({
  selector: 'app-admin-salon-owners',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatCardModule, MatTooltipModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Salon Owner Accounts</h2>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Salon Owner
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{editId ? 'Edit' : 'Add'}} Salon Owner</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="form-grid">
            <mat-form-field><mat-label>Owner Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field><mat-label>Email</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
            <mat-form-field *ngIf="!editId"><mat-label>Password</mat-label><input matInput formControlName="password" type="password"></mat-form-field>
            <mat-form-field><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Salon Name</mat-label><input matInput formControlName="salonName"></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Address</mat-label><input matInput formControlName="address"></mat-form-field>
            <mat-form-field class="span-2"><mat-label>Bio / Description</mat-label><textarea matInput formControlName="bio" rows="3"></textarea></mat-form-field>
            <div class="file-upload">
              <label>Salon Logo</label>
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
        <table mat-table [dataSource]="owners" class="full-width">
          <ng-container matColumnDef="logo">
            <th mat-header-cell *matHeaderCellDef>Logo</th>
            <td mat-cell *matCellDef="let o">
              <div class="owner-avatar" [style.background-image]="o.logo ? 'url('+o.logo+')' : ''">
                <span *ngIf="!o.logo">{{o.salonName?.charAt(0)}}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="salonName">
            <th mat-header-cell *matHeaderCellDef>Salon Name</th>
            <td mat-cell *matCellDef="let o"><strong>{{o.salonName}}</strong></td>
          </ng-container>
          <ng-container matColumnDef="owner">
            <th mat-header-cell *matHeaderCellDef>Owner</th>
            <td mat-cell *matCellDef="let o">
              <div>{{getUserName(o)}}</div>
              <div class="sub-text">{{getUserEmail(o)}}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Address</th>
            <td mat-cell *matCellDef="let o">{{o.address || '—'}}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let o">
              <button mat-icon-button color="primary" (click)="edit(o)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(o._id)" matTooltip="Remove"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p class="empty" *ngIf="owners.length === 0">No salon owners yet.</p>
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
    .preview { max-height: 60px; max-width: 120px; border-radius: 8px; object-fit: cover; }
    .owner-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); background-size: cover; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem; }
    table { width: 100%; }
    .sub-text { font-size: 0.78rem; color: var(--text-muted, #757575); }
    .empty { text-align: center; padding: 32px; color: var(--text-muted, #757575); }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } mat-card { overflow-x: auto; } }
  `]
})
export class AdminSalonOwnersComponent implements OnInit {
  owners: SalonOwner[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  columns = ['logo', 'salonName', 'owner', 'address', 'actions'];

  constructor(private http: HttpClient, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name:      ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', Validators.required],
      phone:     [''],
      salonName: ['', Validators.required],
      address:   [''],
      bio:       ['']
    });
  }

  ngOnInit() { this.load(); }

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  load() {
    this.http.get<SalonOwner[]>('/api/salon-owners', { headers: this.headers() })
      .subscribe(o => this.owners = o);
  }

  openForm() {
    this.showForm = true;
    this.editId = '';
    this.form.reset();
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
    this.imagePreview = '';
    this.imageFile = null;
  }

  edit(o: SalonOwner) {
    this.showForm = true;
    this.editId = o._id;
    const u = o.userId as any;
    this.form.patchValue({ name: u?.name || '', email: u?.email || '', phone: u?.phone || o.phone || '', salonName: o.salonName, address: o.address, bio: o.bio });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.imagePreview = o.logo || '';
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
    Object.entries(this.form.value).forEach(([k, v]) => { if (v) fd.append(k, v as string); });
    if (this.imageFile) fd.append('logo', this.imageFile);

    const req = this.editId
      ? this.http.put(`/api/salon-owners/${this.editId}`, fd, { headers: this.headers() })
      : this.http.post('/api/salon-owners', fd, { headers: this.headers() });

    req.subscribe({
      next: () => { this.snackBar.open('Saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }

  delete(id: string) {
    if (!confirm('Remove this salon owner? This will permanently delete their account and all their color inventory.')) return;
    this.http.delete(`/api/salon-owners/${id}`, { headers: this.headers() }).subscribe({
      next: () => { this.snackBar.open('Removed', 'OK', { duration: 2000 }); this.load(); }
    });
  }

  getUserName(o: SalonOwner): string { return (o.userId as any)?.name || ''; }
  getUserEmail(o: SalonOwner): string { return (o.userId as any)?.email || ''; }
}
