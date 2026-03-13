import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-salon-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard">
      <div class="welcome-banner">
        <div>
          <h2>Welcome back, {{auth.currentUser()?.name}}</h2>
          <p>Manage your salon's color inventory from here.</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/salon-owner/colors">
          <mat-icon>palette</mat-icon> Manage Colors
        </a>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">palette</mat-icon>
          <div class="stat-value">{{totalColors}}</div>
          <div class="stat-label">Total Colors</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon available">check_circle</mat-icon>
          <div class="stat-value">{{availableColors}}</div>
          <div class="stat-label">Available</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon out">cancel</mat-icon>
          <div class="stat-value">{{outOfStockColors}}</div>
          <div class="stat-label">Out of Stock</div>
        </mat-card>
      </div>

      <mat-card class="quick-actions">
        <mat-card-header><mat-card-title>Quick Actions</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="actions-grid">
            <a mat-stroked-button color="primary" routerLink="/salon-owner/colors">
              <mat-icon>add</mat-icon> Add New Color
            </a>
            <a mat-stroked-button routerLink="/salon-owner/profile">
              <mat-icon>edit</mat-icon> Edit Salon Profile
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
    .dashboard { max-width: 900px; }
    .welcome-banner { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .welcome-banner h2 { font-size: 1.5rem; margin-bottom: 4px; }
    .welcome-banner p { opacity: 0.85; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 24px 16px; }
    .stat-icon { font-size: 2.5rem; height: 2.5rem; width: 2.5rem; color: var(--primary); margin-bottom: 8px; }
    .stat-icon.available { color: #2e7d32; }
    .stat-icon.out { color: #c62828; }
    .stat-value { font-size: 2.2rem; font-weight: 700; color: var(--primary-dark); line-height: 1; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
    .quick-actions mat-card-title { font-size: 1.1rem; }
    .actions-grid { display: flex; flex-wrap: wrap; gap: 12px; padding-top: 8px; }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr 1fr; } .welcome-banner { flex-direction: column; } }
  `]
})
export class SalonOwnerDashboardComponent implements OnInit {
  totalColors = 0;
  availableColors = 0;
  outOfStockColors = 0;

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>('/api/colors?owner=me', { headers }).subscribe(colors => {
      this.totalColors      = colors.length;
      this.availableColors  = colors.filter(c => c.status === 'available').length;
      this.outOfStockColors = colors.filter(c => c.status === 'out-of-stock').length;
    });
  }
}
