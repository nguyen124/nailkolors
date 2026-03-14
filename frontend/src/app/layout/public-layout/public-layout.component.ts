import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, CommonModule],
  template: `
    <header class="site-header" [class.scrolled]="scrolled">
      <div class="header-inner container">
        <a routerLink="/" class="logo">
          <img src="assets/logo.png" alt="Serenity Nails & Spa" class="logo-img">
        </a>
        <nav class="desktop-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/services" routerLinkActive="active">Services</a>
          <a routerLink="/gallery" routerLinkActive="active">Gallery</a>
          <a routerLink="/technicians" routerLinkActive="active">Team</a>
          <a routerLink="/blog" routerLinkActive="active">Blog</a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
          <a routerLink="/feedback" routerLinkActive="active">Feedback</a>
        </nav>
        <div class="header-actions">
          <ng-container *ngIf="auth.isLoggedIn(); else guestActions">
            <a [routerLink]="dashboardLink" mat-stroked-button color="primary" class="dash-btn">
              <mat-icon>dashboard</mat-icon> Dashboard
            </a>
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn" title="Account">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header" mat-menu-item disabled>
                <mat-icon>person</mat-icon>
                <span>{{auth.currentUser()?.name}}</span>
              </div>
              <mat-divider></mat-divider>
              <a mat-menu-item [routerLink]="dashboardLink">
                <mat-icon>dashboard</mat-icon> Dashboard
              </a>
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          </ng-container>
          <ng-template #guestActions>
            <a routerLink="/login" mat-stroked-button color="primary">Sign In</a>
            <a routerLink="/register" class="btn-primary register-btn">Register</a>
          </ng-template>
          <a routerLink="/book" class="btn-primary book-btn">Book Now</a>
          <button mat-icon-button class="menu-btn" [matMenuTriggerFor]="mobileMenu">
            <mat-icon>menu</mat-icon>
          </button>
        </div>
      </div>
    </header>
    <mat-menu #mobileMenu="matMenu">
      <a mat-menu-item routerLink="/">Home</a>
      <a mat-menu-item routerLink="/services">Services</a>
      <a mat-menu-item routerLink="/gallery">Gallery</a>
      <a mat-menu-item routerLink="/technicians">Our Team</a>
      <a mat-menu-item routerLink="/blog">Blog</a>
      <a mat-menu-item routerLink="/contact">Contact</a>
      <a mat-menu-item routerLink="/feedback">Feedback</a>
      <a mat-menu-item routerLink="/book">Book Appointment</a>
      <a mat-menu-item routerLink="/my-appointments">My Appointments</a>
      <ng-container *ngIf="auth.isLoggedIn()">
        <mat-divider></mat-divider>
        <a mat-menu-item [routerLink]="dashboardLink"><mat-icon>dashboard</mat-icon> My Dashboard</a>
        <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon> Sign Out</button>
      </ng-container>
    </mat-menu>
    <main><router-outlet></router-outlet></main>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo"><img src="assets/logo.png" alt="Serenity Nails & Spa" class="logo-img"></div>
            <p>Luxury nail care in a relaxing, welcoming environment.</p>
          </div>
          <div class="footer-links">
            <h4>Quick Links</h4>
            <a routerLink="/services">Services</a>
            <a routerLink="/book">Book Now</a>
            <a routerLink="/gallery">Gallery</a>
            <a routerLink="/blog">Blog</a>
          </div>
          <div class="footer-links">
            <h4>Account</h4>
            <a routerLink="/my-appointments">My Appointments</a>
            <a routerLink="/login">Staff Login</a>
          </div>
          <div class="footer-contact">
            <h4>Contact</h4>
            <p><mat-icon>location_on</mat-icon> 646 West FM 78, Cibolo, TX 78108</p>
            <p><mat-icon>phone</mat-icon> (210) 530-1285 or (210) 609-8660</p>
            <p><mat-icon>email</mat-icon> thanhtktran88&#64;gmail.com</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Serenity Nails & Spa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-header { position: sticky; top: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); box-shadow: 0 2px 20px rgba(60,144,66,0.08); transition: all 0.3s; }
    .site-header.scrolled { box-shadow: 0 4px 30px rgba(60,144,66,0.15); }
    .header-inner { display: flex; align-items: center; justify-content: space-between; height: 70px; }
    .logo { display: flex; align-items: center; text-decoration: none; }
    .logo-img { height: 52px; width: auto; object-fit: contain; }
    .desktop-nav { display: flex; gap: 32px; }
    .desktop-nav a { text-decoration: none; color: var(--text-dark); font-weight: 500; position: relative; padding-bottom: 4px; transition: color 0.2s; }
    .desktop-nav a::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--primary); transition: width 0.3s; }
    .desktop-nav a:hover, .desktop-nav a.active { color: var(--primary); }
    .desktop-nav a:hover::after, .desktop-nav a.active::after { width: 100%; }
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .book-btn { font-size: 0.9rem; padding: 8px 24px; }
    .register-btn { font-size: 0.9rem; padding: 8px 20px; }
    .dash-btn { font-size: 0.9rem; }
    .menu-btn { display: none !important; }
    @media (max-width: 900px) { .desktop-nav { display: none; } .menu-btn { display: inline-flex !important; } }
    .site-footer { background: linear-gradient(135deg, #2c2c2c, #1a1a1a); color: #ccc; padding: 64px 0 0; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 48px; }
    .footer-brand .logo-img { height: 60px; filter: brightness(0) invert(1) opacity(0.85); }
    .footer-brand p { margin-top: 12px; line-height: 1.7; }
    .footer-links, .footer-contact { display: flex; flex-direction: column; gap: 8px; }
    .footer-links h4, .footer-contact h4 { color: white; margin-bottom: 8px; font-family: 'Playfair Display', serif; }
    .footer-links a { color: #aaa; text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: var(--primary-light); }
    .footer-contact p { display: flex; align-items: center; gap: 8px; }
    .footer-contact mat-icon { font-size: 16px; height: 16px; width: 16px; color: var(--primary); }
    .footer-bottom { border-top: 1px solid #333; margin-top: 48px; padding: 24px 0; text-align: center; color: #666; }
    @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
  `]
})
export class PublicLayoutComponent {
  scrolled = false;

  get dashboardLink() {
    const role = this.auth.currentUser()?.role;
    if (role === 'admin') return '/admin';
    if (role === 'technician') return '/technician';
    return '/customer';
  }

  constructor(public auth: AuthService) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => { this.scrolled = window.scrollY > 50; });
    }
  }
}
