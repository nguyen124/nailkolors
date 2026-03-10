import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../services/analytics.service';
import { AnalyticsDashboard } from '../../../models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressBarModule, CommonModule],
  template: `
    <div *ngIf="data">
      <h2 class="page-title">Analytics Dashboard</h2>
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon today"><mat-icon>today</mat-icon></div>
          <div><span class="stat-num">{{data.todayTotal}}</span><span class="stat-label">Today's Appointments</span></div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon weekly"><mat-icon>date_range</mat-icon></div>
          <div><span class="stat-num">{{data.weeklyTotal}}</span><span class="stat-label">This Week</span></div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon revenue"><mat-icon>attach_money</mat-icon></div>
          <div><span class="stat-num">\${{data.dailyRevenue | number:'1.0-0'}}</span><span class="stat-label">Est. Daily Revenue</span></div>
        </div>
      </div>
      <div class="analytics-grid">
        <mat-card>
          <mat-card-header><mat-card-title>Popular Services</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="rank-item" *ngFor="let s of data.popularServices; let i = index">
              <span class="rank">{{i+1}}</span>
              <span class="name">{{s.name}}</span>
              <span class="count">{{s.count}} bookings</span>
              <mat-progress-bar mode="determinate" [value]="getPercent(s.count, data.popularServices[0].count)" color="accent"></mat-progress-bar>
            </div>
            <p *ngIf="!data.popularServices.length" class="empty-msg">No data yet</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>Technician Performance</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="rank-item" *ngFor="let t of data.techPerformance; let i = index">
              <span class="rank">{{i+1}}</span>
              <span class="name">{{t.name}}</span>
              <span class="count">{{t.completed}} completed</span>
              <mat-progress-bar mode="determinate" [value]="getPercent(t.completed, data.techPerformance[0].completed || 1)" color="primary"></mat-progress-bar>
            </div>
            <p *ngIf="!data.techPerformance.length" class="empty-msg">No data yet</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header><mat-card-title>Popular Nail Colors</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="color-item" *ngFor="let c of data.popularColors">
              <div class="color-dot" [style.background]="c.colorCode"></div>
              <div class="color-info"><span class="name">{{c.colorName}}</span><span class="brand">{{c.brand}}</span></div>
              <span class="count">{{c.count}}x</span>
            </div>
            <p *ngIf="!data.popularColors.length" class="empty-msg">No data yet</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
    <p *ngIf="!data" style="text-align:center;padding:48px">Loading...</p>
  `,
  styles: [`
    .page-title { font-size: 1.8rem; margin-bottom: 24px; color: var(--primary-dark); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 20px; padding: 24px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; height: 28px; width: 28px; color: white; }
    .stat-icon.today { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); }
    .stat-icon.weekly { background: linear-gradient(135deg, #4a148c, #7b1fa2); }
    .stat-icon.revenue { background: linear-gradient(135deg, #e65100, #ff9800); }
    .stat-num { display: block; font-size: 2rem; font-weight: 700; font-family: 'Playfair Display', serif; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); }
    .analytics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .rank-item { padding: 10px 0; }
    .rank-item .rank { display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); font-size: 0.75rem; font-weight: 700; text-align: center; line-height: 24px; margin-right: 8px; }
    .rank-item .name { font-weight: 600; }
    .rank-item .count { float: right; color: var(--text-muted); font-size: 0.85rem; }
    .rank-item mat-progress-bar { margin-top: 6px; clear: both; }
    .color-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .color-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .color-info { flex: 1; }
    .color-info .name { display: block; font-weight: 600; font-size: 0.9rem; }
    .color-info .brand { display: block; font-size: 0.8rem; color: var(--text-muted); }
    .count { color: var(--primary); font-weight: 700; }
    .empty-msg { color: var(--text-muted); text-align: center; padding: 16px; }
    @media (max-width: 900px) { .stats-grid, .analytics-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  data: AnalyticsDashboard | null = null;
  constructor(private analyticsService: AnalyticsService) {}
  ngOnInit() { this.analyticsService.getDashboard().subscribe(d => this.data = d); }
  getPercent(val: number, max: number) { return max > 0 ? Math.round((val / max) * 100) : 0; }
}
