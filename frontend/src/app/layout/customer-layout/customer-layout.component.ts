import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, CommonModule],
  template: `
    <header class="site-header">
      <div class="header-inner container">
        <a routerLink="/" class="logo">
          <img src="assets/logo.png" alt="Serenity Nails & Spa" class="logo-img">
        </a>
        <nav class="desktop-nav">
          <a routerLink="/">Home</a>
          <a routerLink="/services">Services</a>
          <a routerLink="/book">Book</a>
          <a routerLink="/customer/dashboard" routerLinkActive="active">My Appointments</a>
        </nav>
        <div class="header-actions">
          <span class="user-greeting">Hi, {{auth.currentUser()?.name}}</span>
          <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>account_circle</mat-icon></button>
          <mat-menu #menu="matMenu">
            <a mat-menu-item routerLink="/customer/dashboard"><mat-icon>dashboard</mat-icon> My Dashboard</a>
            <a mat-menu-item routerLink="/book"><mat-icon>event_available</mat-icon> Book Appointment</a>
            <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon> Sign Out</button>
          </mat-menu>
        </div>
      </div>
    </header>
    <main><router-outlet></router-outlet></main>
    <footer class="mini-footer">
      <div class="container">
        <p>&copy; 2026 Serenity Nails & Spa &nbsp;·&nbsp; <a routerLink="/contact">Contact</a> &nbsp;·&nbsp; <a routerLink="/blog">Blog</a></p>
      </div>
    </footer>
  `,
  styles: [`
    .site-header { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(10px); box-shadow: 0 2px 20px rgba(60,144,66,0.08); }
    .header-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
    .logo { display: flex; align-items: center; text-decoration: none; }
    .logo-img { height: 44px; width: auto; object-fit: contain; }
    .logo-text { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--primary); }
    .desktop-nav { display: flex; gap: 24px; }
    .desktop-nav a { text-decoration: none; color: var(--text-dark); font-weight: 500; transition: color 0.2s; }
    .desktop-nav a:hover, .desktop-nav a.active { color: var(--primary); }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .user-greeting { font-size: 0.9rem; color: var(--text-muted); }
    .mini-footer { background: #f5f5f5; border-top: 1px solid #eee; padding: 16px 0; text-align: center; font-size: 0.85rem; color: var(--text-muted); }
    .mini-footer a { color: var(--primary); text-decoration: none; }
    @media (max-width: 768px) { .desktop-nav { display: none; } .user-greeting { display: none; } }
  `]
})
export class CustomerLayoutComponent {
  constructor(public auth: AuthService) {}
}
