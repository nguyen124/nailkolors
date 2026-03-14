import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackService, Feedback } from '../../../services/feedback.service';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h2>Customer Feedback Inbox</h2>
      <span class="unread-badge" *ngIf="unreadCount > 0">{{unreadCount}} unread</span>
    </div>

    <div class="filter-tabs">
      <button [class.active]="filter === 'all'" (click)="filter = 'all'">All ({{feedback.length}})</button>
      <button [class.active]="filter === 'unread'" (click)="filter = 'unread'">Unread ({{unreadCount}})</button>
      <button [class.active]="filter === 'read'" (click)="filter = 'read'">Read ({{readCount}})</button>
    </div>

    <div class="inbox-list">
      <div class="inbox-item card" *ngFor="let f of filtered" [class.unread]="!f.isRead">
        <div class="item-top">
          <div class="sender-avatar">{{f.name.charAt(0).toUpperCase()}}</div>
          <div class="sender-info">
            <strong>{{f.name}}</strong>
            <span class="contact-row">
              <span *ngIf="f.phone" class="contact-chip"><mat-icon>phone</mat-icon>{{f.phone}}</span>
              <span *ngIf="f.email" class="contact-chip"><mat-icon>email</mat-icon>{{f.email}}</span>
            </span>
            <span class="service-tag" *ngIf="f.service">{{f.service}}</span>
          </div>
          <div class="item-right">
            <span class="unread-dot" *ngIf="!f.isRead"></span>
            <span class="date">{{f.createdAt | date:'MMM d, y · h:mm a'}}</span>
          </div>
        </div>
        <p class="message">{{f.message}}</p>
        <div class="item-actions">
          <button mat-stroked-button (click)="toggleRead(f)" [color]="f.isRead ? '' : 'primary'">
            <mat-icon>{{f.isRead ? 'mark_email_unread' : 'mark_email_read'}}</mat-icon>
            {{f.isRead ? 'Mark Unread' : 'Mark Read'}}
          </button>
          <button mat-stroked-button color="warn" (click)="remove(f)">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>

      <div class="empty-state" *ngIf="filtered.length === 0">
        <mat-icon>inbox</mat-icon>
        <p>No messages found.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-family: 'Playfair Display', serif; }
    .unread-badge { background: var(--primary); color: white; border-radius: 12px; padding: 4px 12px; font-size: 0.8rem; font-weight: 700; }
    .filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .filter-tabs button { padding: 8px 20px; border: 1px solid #e0e0e0; border-radius: 20px; background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .filter-tabs button.active { background: var(--primary); color: white; border-color: var(--primary); }
    .inbox-list { display: flex; flex-direction: column; gap: 16px; }
    .inbox-item { padding: 20px 24px; border-left: 4px solid #e0e0e0; transition: border-color 0.2s; }
    .inbox-item.unread { border-left-color: var(--primary); background: #f9fef9; }
    .item-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .sender-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; flex-shrink: 0; }
    .sender-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .sender-info strong { font-size: 1rem; }
    .contact-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .contact-chip { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--text-muted); }
    .contact-chip mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .service-tag { font-size: 0.75rem; background: #f3e5f5; color: var(--primary-dark); padding: 2px 8px; border-radius: 4px; font-weight: 600; align-self: flex-start; }
    .item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .unread-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); }
    .date { font-size: 0.78rem; color: #bbb; white-space: nowrap; }
    .message { color: var(--text-muted); line-height: 1.7; margin: 0 0 16px; white-space: pre-wrap; }
    .item-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.3; display: block; margin: 0 auto 12px; }
  `]
})
export class AdminFeedbackComponent implements OnInit {
  feedback: Feedback[] = [];
  filter: 'all' | 'unread' | 'read' = 'unread';

  constructor(private feedbackService: FeedbackService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() { this.feedbackService.getAll().subscribe(f => this.feedback = f); }

  get filtered() {
    if (this.filter === 'unread') return this.feedback.filter(f => !f.isRead);
    if (this.filter === 'read') return this.feedback.filter(f => f.isRead);
    return this.feedback;
  }

  get unreadCount() { return this.feedback.filter(f => !f.isRead).length; }
  get readCount() { return this.feedback.filter(f => f.isRead).length; }

  toggleRead(f: Feedback) {
    const isRead = !f.isRead;
    this.feedbackService.update(f._id, { isRead }).subscribe({
      next: () => { f.isRead = isRead; },
      error: () => this.snackBar.open('Error', '', { duration: 1500 })
    });
  }

  remove(f: Feedback) {
    if (!confirm(`Delete message from "${f.name}"?`)) return;
    this.feedbackService.delete(f._id).subscribe({
      next: () => { this.feedback = this.feedback.filter(x => x._id !== f._id); this.snackBar.open('Deleted', '', { duration: 1500 }); },
      error: () => this.snackBar.open('Error', '', { duration: 1500 })
    });
  }
}
