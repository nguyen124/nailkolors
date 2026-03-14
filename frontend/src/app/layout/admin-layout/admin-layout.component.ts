import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule, MatButtonModule, MatSnackBarModule, CommonModule],
  template: `
    <mat-sidenav-container class="admin-container">
      <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'" [opened]="!isMobile" class="admin-sidenav">
        <div class="sidenav-header">
          <img src="assets/logo.png" alt="Serenity Nails & Spa" class="logo-img">
          <div class="user-info"><mat-icon>admin_panel_settings</mat-icon><span>Admin Panel</span></div>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/admin/appointments" routerLinkActive="active">
            <mat-icon matListItemIcon>calendar_today</mat-icon><span matListItemTitle>Appointments</span>
            <span *ngIf="newApptCount > 0" class="badge-count">{{newApptCount}}</span>
          </a>
          <a mat-list-item routerLink="/admin/services" routerLinkActive="active">
            <mat-icon matListItemIcon>spa</mat-icon><span matListItemTitle>Services</span>
          </a>
          <a mat-list-item routerLink="/admin/colors" routerLinkActive="active">
            <mat-icon matListItemIcon>palette</mat-icon><span matListItemTitle>Nail Colors</span>
          </a>
          <a mat-list-item routerLink="/admin/technicians" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Technicians</span>
          </a>
          <a mat-list-item routerLink="/admin/posts" routerLinkActive="active">
            <mat-icon matListItemIcon>article</mat-icon><span matListItemTitle>Blog / Promos</span>
          </a>
          <a mat-list-item routerLink="/admin/addons" routerLinkActive="active">
            <mat-icon matListItemIcon>extension</mat-icon><span matListItemTitle>Add-Ons</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <a mat-list-item routerLink="/"><mat-icon matListItemIcon>public</mat-icon><span matListItemTitle>View Site</span></a>
          <button mat-list-item (click)="logout()"><mat-icon matListItemIcon>logout</mat-icon><span matListItemTitle>Logout</span></button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="admin-content">
        <mat-toolbar class="admin-toolbar">
          <button mat-icon-button *ngIf="isMobile" (click)="sidenav.toggle()" class="menu-toggle">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Admin Dashboard</span>
          <span class="spacer"></span>
          <span class="user-name">{{auth.currentUser()?.name}}</span>
        </mat-toolbar>
        <div class="admin-main"><router-outlet></router-outlet></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-container { height: 100vh; }
    .admin-sidenav { width: 260px; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); color: white; display: flex; flex-direction: column; }
    .sidenav-header { padding: 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo-img { height: 56px; width: auto; object-fit: contain; margin-bottom: 8px; }
    .user-info { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 0.85rem; }
    .admin-sidenav mat-nav-list a { color: rgba(255,255,255,0.7); border-radius: 8px; margin: 2px 8px; transition: all 0.2s; }
    .admin-sidenav mat-nav-list a:hover, .admin-sidenav mat-nav-list a.active { background: rgba(60,144,66,0.2); color: white; }
    .admin-sidenav mat-icon { color: var(--primary-light); }
    .badge-count { background: var(--primary); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; display: flex; align-items: center; justify-content: center; margin-left: auto; }
    .sidenav-footer { margin-top: auto; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.1); }
    .sidenav-footer a, .sidenav-footer button { color: rgba(255,255,255,0.6); width: 100%; }
    .admin-toolbar { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .toolbar-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--primary-dark); }
    .spacer { flex: 1; }
    .user-name { color: var(--text-muted); font-size: 0.9rem; }
    .admin-content { background: #f5f5f5; }
    .admin-main { padding: 24px; }
    @media (max-width: 768px) { .admin-main { padding: 16px; } .user-name { display: none; } }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  newApptCount = 0;
  isMobile = false;
  private sub!: Subscription;

  constructor(public auth: AuthService, private socket: SocketService, private snackBar: MatSnackBar) {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => { this.isMobile = window.innerWidth <= 768; });
  }

  ngOnInit() {
    this.socket.connect();
    this.socket.joinAdminRoom();
    this.sub = this.socket.onNewAppointment().subscribe(appt => {
      this.newApptCount++;
      this.snackBar.open(`New booking: ${appt.customerName} - ${appt.serviceId?.name}`, 'View', { duration: 5000 });
    });
  }

  logout() { this.auth.logout(); }

  ngOnDestroy() { this.sub?.unsubscribe(); this.socket.disconnect(); }
}
