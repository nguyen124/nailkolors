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
import { TechnicianService } from '../../services/technician.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-technician-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule, MatButtonModule, MatSnackBarModule, CommonModule],
  template: `
    <mat-sidenav-container class="tech-container">
      <mat-sidenav mode="side" opened class="tech-sidenav">
        <div class="sidenav-header">
          <div class="logo">💅 Serenity Nails & Spa</div>
          <div class="user-info"><mat-icon>face</mat-icon><span>{{auth.currentUser()?.name}}</span></div>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/technician/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>My Dashboard</span>
          </a>
          <a mat-list-item routerLink="/technician/schedule" routerLinkActive="active">
            <mat-icon matListItemIcon>calendar_month</mat-icon><span matListItemTitle>My Schedule</span>
          </a>
          <a mat-list-item routerLink="/technician/availability" routerLinkActive="active">
            <mat-icon matListItemIcon>event_available</mat-icon><span matListItemTitle>Availability</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <a mat-list-item routerLink="/"><mat-icon matListItemIcon>public</mat-icon><span matListItemTitle>View Site</span></a>
          <button mat-list-item (click)="logout()"><mat-icon matListItemIcon>logout</mat-icon><span matListItemTitle>Logout</span></button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="tech-content">
        <mat-toolbar class="tech-toolbar"><span>Technician Dashboard</span></mat-toolbar>
        <div class="tech-main"><router-outlet></router-outlet></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .tech-container { height: 100vh; }
    .tech-sidenav { width: 250px; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); color: white; display: flex; flex-direction: column; }
    .sidenav-header { padding: 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--primary-light); margin-bottom: 8px; }
    .user-info { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 0.85rem; }
    .tech-sidenav mat-nav-list a { color: rgba(255,255,255,0.7); border-radius: 8px; margin: 2px 8px; }
    .tech-sidenav mat-nav-list a:hover, .tech-sidenav mat-nav-list a.active { background: rgba(60,144,66,0.2); color: white; }
    .tech-sidenav mat-icon { color: var(--primary-light); }
    .sidenav-footer { margin-top: auto; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.1); }
    .sidenav-footer a, .sidenav-footer button { color: rgba(255,255,255,0.6); width: 100%; }
    .tech-toolbar { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .tech-content { background: #f5f5f5; }
    .tech-main { padding: 24px; }
  `]
})
export class TechnicianLayoutComponent implements OnInit, OnDestroy {
  private sub!: Subscription;

  constructor(public auth: AuthService, private techService: TechnicianService, private socket: SocketService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.socket.connect();
    this.techService.getMyProfile().subscribe(tech => this.socket.joinTechnicianRoom(tech._id));
    this.sub = this.socket.onNewAppointment().subscribe(appt => {
      this.snackBar.open(`New booking: ${appt.customerName} at ${appt.time}`, 'OK', { duration: 6000 });
    });
  }

  logout() { this.auth.logout(); }
  ngOnDestroy() { this.sub?.unsubscribe(); this.socket.disconnect(); }
}
