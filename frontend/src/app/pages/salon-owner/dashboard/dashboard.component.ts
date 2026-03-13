import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { MySalonService } from '../../../services/my-salon.service';

@Component({
  selector: 'app-salon-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard">
      <div class="welcome-banner">
        <div>
          <h2>Welcome back, {{auth.currentUser()?.name}}</h2>
          <p>Manage your salon from the dashboard.</p>
        </div>
        <a mat-raised-button color="primary" [routerLink]="['/salon-owner', slug, 'colors']">
          <mat-icon>palette</mat-icon> Manage Colors
        </a>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">today</mat-icon>
          <div class="stat-value">{{analytics.todayTotal}}</div>
          <div class="stat-label">Today's Appointments</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon weekly">date_range</mat-icon>
          <div class="stat-value">{{analytics.weeklyTotal}}</div>
          <div class="stat-label">This Week</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon revenue">attach_money</mat-icon>
          <div class="stat-value">\${{analytics.weeklyRevenue | number:'1.0-0'}}</div>
          <div class="stat-label">Weekly Revenue</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon services">spa</mat-icon>
          <div class="stat-value">{{analytics.totalServices}}</div>
          <div class="stat-label">Active Services</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">palette</mat-icon>
          <div class="stat-value">{{analytics.totalColors}}</div>
          <div class="stat-label">Nail Colors</div>
        </mat-card>
      </div>

      <mat-card class="quick-actions">
        <mat-card-header><mat-card-title>Quick Actions</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="actions-grid">
            <a mat-stroked-button color="primary" [routerLink]="['/salon-owner', slug, 'services']">
              <mat-icon>add</mat-icon> Add Service
            </a>
            <a mat-stroked-button color="primary" [routerLink]="['/salon-owner', slug, 'colors']">
              <mat-icon>palette</mat-icon> Manage Colors
            </a>
            <a mat-stroked-button color="primary" [routerLink]="['/salon-owner', slug, 'technicians']">
              <mat-icon>people</mat-icon> Manage Technicians
            </a>
            <a mat-stroked-button color="primary" [routerLink]="['/salon-owner', slug, 'appointments']">
              <mat-icon>calendar_today</mat-icon> View Appointments
            </a>
            <a mat-stroked-button [routerLink]="['/salon-owner', slug, 'posts']">
              <mat-icon>article</mat-icon> Create Post
            </a>
            <a mat-stroked-button routerLink="/gallery">
              <mat-icon>visibility</mat-icon> View Gallery
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1000px; }
    .welcome-banner { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, var(--primary, #4caf50), var(--primary-dark, #1b5e20)); color: white; border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .welcome-banner h2 { font-size: 1.5rem; margin-bottom: 4px; }
    .welcome-banner p { opacity: 0.85; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 24px 16px; }
    .stat-icon { font-size: 2.5rem; height: 2.5rem; width: 2.5rem; color: var(--primary, #4caf50); margin-bottom: 8px; }
    .stat-icon.weekly { color: #1565c0; }
    .stat-icon.revenue { color: #2e7d32; }
    .stat-icon.services { color: #ad1457; }
    .stat-value { font-size: 2.2rem; font-weight: 700; color: var(--primary-dark, #1b5e20); line-height: 1; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted, #757575); margin-top: 4px; }
    .quick-actions mat-card-title { font-size: 1.1rem; }
    .actions-grid { display: flex; flex-wrap: wrap; gap: 12px; padding-top: 8px; }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr 1fr; } .welcome-banner { flex-direction: column; } }
  `]
})
export class SalonOwnerDashboardComponent implements OnInit {
  slug = '';
  analytics = {
    todayTotal: 0,
    weeklyTotal: 0,
    weeklyRevenue: 0,
    totalServices: 0,
    totalColors: 0
  };

  constructor(public auth: AuthService, private mySalonService: MySalonService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.parent?.params.subscribe(p => { this.slug = p['slug'] || ''; });
    this.mySalonService.getAnalytics().subscribe({
      next: data => { this.analytics = { ...this.analytics, ...data }; },
      error: () => {}
    });
  }
}
