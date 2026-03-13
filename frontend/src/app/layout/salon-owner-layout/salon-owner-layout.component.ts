import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-salon-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule,
    MatIconModule, MatToolbarModule, MatButtonModule, CommonModule],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'" [opened]="!isMobile" class="sidenav">
        <div class="sidenav-header">
          <img src="assets/logo.png" alt="Logo" class="logo-img">
          <div class="user-info">
            <mat-icon>store</mat-icon>
            <span>Salon Owner</span>
          </div>
          <div class="owner-name">{{auth.currentUser()?.name}}</div>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/salon-owner/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/salon-owner/colors" routerLinkActive="active">
            <mat-icon matListItemIcon>palette</mat-icon>
            <span matListItemTitle>Color Inventory</span>
          </a>
          <a mat-list-item routerLink="/salon-owner/profile" routerLinkActive="active">
            <mat-icon matListItemIcon>store</mat-icon>
            <span matListItemTitle>Salon Profile</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <a mat-list-item routerLink="/"><mat-icon matListItemIcon>public</mat-icon><span matListItemTitle>View Site</span></a>
          <button mat-list-item (click)="logout()"><mat-icon matListItemIcon>logout</mat-icon><span matListItemTitle>Logout</span></button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <mat-toolbar class="toolbar">
          <button mat-icon-button *ngIf="isMobile" (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Salon Owner Portal</span>
          <span class="spacer"></span>
          <span class="user-name">{{auth.currentUser()?.name}}</span>
        </mat-toolbar>
        <div class="page-content"><router-outlet></router-outlet></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container { height: 100vh; }
    .sidenav { width: 260px; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); color: white; display: flex; flex-direction: column; }
    .sidenav-header { padding: 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo-img { height: 52px; width: auto; object-fit: contain; margin-bottom: 8px; }
    .user-info { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 0.82rem; }
    .user-info mat-icon { font-size: 18px; height: 18px; width: 18px; color: var(--primary-light); }
    .owner-name { font-size: 0.95rem; font-weight: 600; color: white; margin-top: 4px; }
    .sidenav mat-nav-list a { color: rgba(255,255,255,0.7); border-radius: 8px; margin: 2px 8px; transition: all 0.2s; }
    .sidenav mat-nav-list a:hover, .sidenav mat-nav-list a.active { background: rgba(60,144,66,0.2); color: white; }
    .sidenav mat-icon { color: var(--primary-light); }
    .sidenav-footer { margin-top: auto; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.1); }
    .sidenav-footer a, .sidenav-footer button { color: rgba(255,255,255,0.6); width: 100%; }
    .toolbar { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .toolbar-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--primary-dark); }
    .spacer { flex: 1; }
    .user-name { color: var(--text-muted); font-size: 0.9rem; }
    .main-content { background: #f5f5f5; }
    .page-content { padding: 24px; }
    @media (max-width: 768px) { .page-content { padding: 16px; } .user-name { display: none; } }
  `]
})
export class SalonOwnerLayoutComponent {
  isMobile = false;
  constructor(public auth: AuthService) {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => { this.isMobile = window.innerWidth <= 768; });
  }
  logout() { this.auth.logout(); }
}
