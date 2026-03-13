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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MySalonService } from '../../../services/my-salon.service';

@Component({
  selector: 'app-salon-owner-posts',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatCardModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Blog / Promotions</h2>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> New Post</button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header><mat-card-title>{{editId ? 'Edit' : 'New'}} Post</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="form-stack">
            <mat-form-field class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>
            <mat-form-field class="full-width">
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="8"></textarea>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Publish Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="publishDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <div class="file-upload">
              <label>Post Image</label>
              <input type="file" accept="image/*" (change)="onFile($event)">
              <img *ngIf="imagePreview" [src]="imagePreview" class="preview">
            </div>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Publish</button>
          <button mat-stroked-button (click)="cancelForm()">Cancel</button>
        </mat-card-actions>
      </mat-card>

      <mat-card>
        <table mat-table [dataSource]="posts" class="full-width">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let p">{{p.title}}</td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Published</th>
            <td mat-cell *matCellDef="let p">{{p.publishDate | date:'mediumDate'}}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary" (click)="edit(p)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(p._id)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <p *ngIf="posts.length === 0 && !loading" class="empty">No posts yet.</p>
        <p *ngIf="loading" class="empty">Loading...</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; color: var(--primary-dark); }
    .form-card { margin-bottom: 24px; }
    .form-stack { display: flex; flex-direction: column; gap: 16px; padding: 16px 0; }
    .full-width { width: 100%; }
    .file-upload { display: flex; flex-direction: column; gap: 8px; }
    .preview { max-height: 150px; border-radius: 8px; max-width: 300px; }
    table { width: 100%; }
    .empty { text-align: center; color: var(--text-muted, #757575); padding: 32px; }
    @media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; gap: 12px; } mat-card { overflow-x: auto; } }
  `]
})
export class SalonOwnerPostsComponent implements OnInit {
  posts: any[] = [];
  form: FormGroup;
  showForm = false;
  editId = '';
  imageFile: File | null = null;
  imagePreview = '';
  loading = false;
  columns = ['title', 'date', 'actions'];

  constructor(private mySalonService: MySalonService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      publishDate: [new Date()]
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.mySalonService.getPosts().subscribe({
      next: p => { this.posts = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm() {
    this.showForm = true;
    this.editId = '';
    this.form.reset({ publishDate: new Date() });
    this.imagePreview = '';
    this.imageFile = null;
  }

  edit(p: any) {
    this.showForm = true;
    this.editId = p._id;
    this.form.patchValue({ title: p.title, content: p.content, publishDate: p.publishDate ? new Date(p.publishDate) : new Date() });
    this.imagePreview = p.image || '';
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
    const vals = this.form.value;
    fd.append('title', vals.title);
    fd.append('content', vals.content);
    if (vals.publishDate) fd.append('publishDate', new Date(vals.publishDate).toISOString());
    if (this.imageFile) fd.append('image', this.imageFile);
    const req = this.editId
      ? this.mySalonService.updatePost(this.editId, fd)
      : this.mySalonService.createPost(fd);
    req.subscribe({
      next: () => { this.snackBar.open('Post saved!', 'OK', { duration: 2000 }); this.load(); this.cancelForm(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }

  delete(id: string) {
    if (!confirm('Delete this post?')) return;
    this.mySalonService.deletePost(id).subscribe({
      next: () => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); },
      error: e => this.snackBar.open(e.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }
}
