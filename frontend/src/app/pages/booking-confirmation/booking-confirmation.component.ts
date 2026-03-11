import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [MatButtonModule, CommonModule, RouterLink],
  template: `
    <section class="section confirmation-page">
      <div class="container">
        <div class="confirmation-card card" *ngIf="appointment">
          <div class="success-icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p class="subtitle">Thank you, {{appointment.customerName}}! A confirmation email has been sent to {{appointment.customerEmail}}</p>
          <div class="details">
            <div class="detail-row"><span>Service</span><strong>{{service?.name}}</strong></div>
            <div class="detail-row"><span>Date</span><strong>{{appointment.date | date:'fullDate'}}</strong></div>
            <div class="detail-row"><span>Time</span><strong>{{appointment.time}}</strong></div>
            <div class="detail-row"><span>Booking ID</span><strong class="id">{{appointment._id}}</strong></div>
          </div>
          <div class="actions">
            <a routerLink="/my-appointments" mat-stroked-button color="primary">View My Appointments</a>
            <a routerLink="/book" mat-raised-button color="primary">Book Another</a>
            <a routerLink="/" mat-button>← Home</a>
          </div>
        </div>
        <div class="confirmation-card card" *ngIf="!appointment">
          <h2>No booking information found.</h2>
          <a routerLink="/book" mat-raised-button color="primary" style="margin-top:16px">Book an Appointment</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .confirmation-page { min-height: 80vh; display: flex; align-items: center; background: linear-gradient(135deg, #f1f8f1, #e8f5e9); }
    .confirmation-card { max-width: 600px; margin: 0 auto; padding: 48px; text-align: center; }
    .success-icon { font-size: 4rem; margin-bottom: 16px; }
    h1 { font-size: 2.5rem; color: var(--primary-dark); margin-bottom: 16px; }
    .subtitle { color: var(--text-muted); margin-bottom: 32px; line-height: 1.7; }
    .details { text-align: left; background: var(--bg-light); border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .detail-row span { color: var(--text-muted); }
    .id { font-size: 0.75rem; color: var(--text-muted); }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  appointment: any;
  service: any;
  constructor(private router: Router) {}
  ngOnInit() {
    this.appointment = history.state?.appointment;
    this.service = history.state?.service;
  }
}
