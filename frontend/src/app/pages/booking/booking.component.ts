import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { TechnicianService } from '../../services/technician.service';
import { ColorService } from '../../services/color.service';
import { AppointmentService } from '../../services/appointment.service';
import { Service, Technician, NailColor } from '../../models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="booking-hero">
      <div class="container"><h1>Book Your Appointment</h1><p>Follow the steps below to schedule your visit</p></div>
    </div>
    <section class="section">
      <div class="container booking-container">
        <mat-stepper [linear]="true" #stepper class="booking-stepper">

          <!-- Step 1: Service -->
          <mat-step [stepControl]="step1">
            <ng-template matStepLabel>Select Service</ng-template>
            <form [formGroup]="step1">
              <h3 class="step-title">Choose a Service</h3>
              <div class="filter-chips">
                <button type="button" class="chip" [class.active]="activeCategory===''" (click)="filterServices('')">All</button>
                <button type="button" class="chip" *ngFor="let c of categories" [class.active]="activeCategory===c" (click)="filterServices(c)">{{c}}</button>
              </div>
              <div class="services-grid">
                <div class="service-option" *ngFor="let s of filteredServices"
                  [class.selected]="step1.get('serviceId')?.value === s._id"
                  (click)="selectService(s)">
                  <div class="service-info">
                    <h4>{{s.name}}</h4>
                    <p>{{s.description | slice:0:80}}</p>
                    <div class="service-meta">
                      <span class="price">\${{s.price}}</span>
                      <span><mat-icon>schedule</mat-icon> {{s.duration}} min</span>
                    </div>
                  </div>
                  <mat-icon class="check" *ngIf="step1.get('serviceId')?.value === s._id">check_circle</mat-icon>
                </div>
              </div>
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext [disabled]="step1.invalid">Next →</button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Color -->
          <mat-step>
            <ng-template matStepLabel>Nail Color (Optional)</ng-template>
            <h3 class="step-title">Choose a Nail Color <span class="optional">(Optional)</span></h3>
            <div class="colors-grid">
              <div class="color-option" *ngFor="let c of availableColors"
                [class.selected]="selectedColorId === c._id"
                (click)="selectedColorId = selectedColorId === c._id ? '' : c._id">
                <div class="color-swatch" [style.background]="c.colorCode"></div>
                <div class="color-details">
                  <span class="color-name">{{c.colorName}}</span>
                  <span class="color-brand">{{c.brand}}</span>
                </div>
                <mat-icon *ngIf="selectedColorId === c._id">check_circle</mat-icon>
              </div>
            </div>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>← Back</button>
              <button mat-raised-button color="primary" matStepperNext>Next →</button>
            </div>
          </mat-step>

          <!-- Step 3: Technician -->
          <mat-step [stepControl]="step3">
            <ng-template matStepLabel>Select Technician</ng-template>
            <form [formGroup]="step3">
              <h3 class="step-title">Choose Your Technician</h3>
              <div class="tech-options">
                <div class="tech-option" [class.selected]="step3.get('technicianId')?.value === 'auto'"
                  (click)="step3.get('technicianId')?.setValue('auto')">
                  <div class="tech-avatar auto">🎲</div>
                  <div><h4>Auto Assign</h4><p>Let us pick the best available technician</p></div>
                  <mat-icon *ngIf="step3.get('technicianId')?.value === 'auto'">check_circle</mat-icon>
                </div>
                <div class="tech-option" *ngFor="let t of technicians"
                  [class.selected]="step3.get('technicianId')?.value === t._id"
                  (click)="step3.get('technicianId')?.setValue(t._id)">
                  <div class="tech-avatar" [style.background-image]="t.photo ? 'url(' + t.photo + ')' : ''">
                    <span *ngIf="!t.photo">{{t.name.charAt(0)}}</span>
                  </div>
                  <div><h4>{{t.name}}</h4><p>{{t.specialties.join(', ')}}</p></div>
                  <mat-icon *ngIf="step3.get('technicianId')?.value === t._id">check_circle</mat-icon>
                </div>
              </div>
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>← Back</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="step3.invalid">Next →</button>
              </div>
            </form>
          </mat-step>

          <!-- Step 4: Date & Time -->
          <mat-step [stepControl]="step4">
            <ng-template matStepLabel>Date & Time</ng-template>
            <form [formGroup]="step4">
              <h3 class="step-title">Choose Date & Time</h3>
              <div class="datetime-grid">
                <div>
                  <mat-form-field class="full-width">
                    <mat-label>Date</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate" (dateChange)="onDateChange()">
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>
                <div>
                  <p class="time-label">Available Times</p>
                  <div class="loading-slots" *ngIf="loadingSlots"><mat-spinner diameter="30"></mat-spinner></div>
                  <div class="time-slots" *ngIf="!loadingSlots">
                    <button type="button" class="time-slot" *ngFor="let slot of timeSlots"
                      [class.selected]="step4.get('time')?.value === slot"
                      (click)="step4.get('time')?.setValue(slot)">{{slot}}</button>
                    <p class="no-slots" *ngIf="timeSlots.length === 0 && step4.get('date')?.value">No slots available for this date</p>
                  </div>
                </div>
              </div>
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>← Back</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="step4.invalid">Next →</button>
              </div>
            </form>
          </mat-step>

          <!-- Step 5: Customer Info -->
          <mat-step [stepControl]="step5">
            <ng-template matStepLabel>Your Details</ng-template>
            <form [formGroup]="step5">
              <h3 class="step-title">Your Information</h3>
              <mat-form-field class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="customerName">
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
              <mat-form-field class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="customerPhone" type="tel">
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>
              <mat-form-field class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="customerEmail" type="email">
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>
              <mat-form-field class="full-width">
                <mat-label>Special Requests (Optional)</mat-label>
                <textarea matInput formControlName="notes" rows="3"></textarea>
              </mat-form-field>
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>← Back</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="step5.invalid">Review →</button>
              </div>
            </form>
          </mat-step>

          <!-- Step 6: Confirm -->
          <mat-step>
            <ng-template matStepLabel>Confirm</ng-template>
            <h3 class="step-title">Review Your Appointment</h3>
            <div class="summary-card card" *ngIf="selectedService">
              <div class="summary-row"><span>Service</span><strong>{{selectedService.name}}</strong></div>
              <div class="summary-row"><span>Price</span><strong>\${{selectedService.price}}</strong></div>
              <div class="summary-row"><span>Duration</span><strong>{{selectedService.duration}} minutes</strong></div>
              <div class="summary-row" *ngIf="selectedColor"><span>Nail Color</span><strong>{{selectedColor.colorName}} ({{selectedColor.brand}})</strong></div>
              <div class="summary-row"><span>Date</span><strong>{{step4.get('date')?.value | date:'fullDate'}}</strong></div>
              <div class="summary-row"><span>Time</span><strong>{{step4.get('time')?.value}}</strong></div>
              <div class="summary-row"><span>Name</span><strong>{{step5.get('customerName')?.value}}</strong></div>
              <div class="summary-row"><span>Phone</span><strong>{{step5.get('customerPhone')?.value}}</strong></div>
              <div class="summary-row"><span>Email</span><strong>{{step5.get('customerEmail')?.value}}</strong></div>
            </div>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>← Back</button>
              <button mat-raised-button color="primary" (click)="confirm()" [disabled]="submitting">
                <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
                <span *ngIf="!submitting">Confirm Booking</span>
              </button>
            </div>
          </mat-step>

        </mat-stepper>
      </div>
    </section>
  `,
  styles: [`
    .booking-hero { background: linear-gradient(135deg, var(--primary), #880e4f); color: white; padding: 80px 0; text-align: center; }
    .booking-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .booking-container { max-width: 900px; }
    .booking-stepper { border-radius: var(--radius); box-shadow: var(--shadow); }
    .step-title { font-size: 1.5rem; margin: 24px 0 16px; color: var(--primary-dark); }
    .optional { font-size: 0.9rem; color: var(--text-muted); font-family: 'Lato', sans-serif; font-weight: 400; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .chip { padding: 6px 16px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; text-transform: capitalize; }
    .chip.active, .chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .service-option { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 2px solid #eee; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .service-option.selected { border-color: var(--primary); background: var(--bg-light); }
    .service-option:hover { border-color: var(--primary-light); }
    .service-info h4 { margin-bottom: 4px; }
    .service-info p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
    .service-meta { display: flex; gap: 16px; align-items: center; }
    .service-meta .price { color: var(--primary); font-weight: 700; }
    .service-meta span { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: var(--text-muted); }
    .service-meta mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .check { color: var(--primary); }
    .colors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; max-height: 400px; overflow-y: auto; padding: 4px; }
    .color-option { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 2px solid #eee; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .color-option.selected { border-color: var(--primary); background: var(--bg-light); }
    .color-swatch { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .color-name { display: block; font-weight: 600; font-size: 0.85rem; }
    .color-brand { display: block; font-size: 0.75rem; color: var(--text-muted); }
    .tech-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .tech-option { display: flex; align-items: center; gap: 16px; padding: 16px; border: 2px solid #eee; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .tech-option.selected { border-color: var(--primary); background: var(--bg-light); }
    .tech-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; background-size: cover; background-position: center; flex-shrink: 0; }
    .tech-avatar.auto { font-size: 1.5rem; background: linear-gradient(135deg, #ffd54f, #ff8f00); }
    .tech-option h4 { margin-bottom: 4px; }
    .tech-option p { font-size: 0.85rem; color: var(--text-muted); }
    .tech-option mat-icon { margin-left: auto; color: var(--primary); }
    .datetime-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
    .time-label { font-weight: 600; margin-bottom: 12px; }
    .time-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .time-slot { padding: 10px 4px; border: 2px solid #eee; border-radius: 8px; background: white; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .time-slot.selected { background: var(--primary); color: white; border-color: var(--primary); }
    .loading-slots { display: flex; justify-content: center; padding: 24px; }
    .no-slots { color: var(--text-muted); text-align: center; padding: 24px; }
    .summary-card { padding: 24px; margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row span { color: var(--text-muted); }
    .step-actions { display: flex; gap: 16px; margin-top: 24px; padding: 16px 0; }
    @media (max-width: 600px) { .services-grid { grid-template-columns: 1fr; } .datetime-grid { grid-template-columns: 1fr; } .time-slots { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class BookingComponent implements OnInit {
  step1: FormGroup;
  step3: FormGroup;
  step4: FormGroup;
  step5: FormGroup;

  services: Service[] = [];
  filteredServices: Service[] = [];
  technicians: Technician[] = [];
  availableColors: NailColor[] = [];
  timeSlots: string[] = [];
  selectedService: Service | null = null;
  selectedColor: NailColor | null = null;
  selectedColorId = '';
  categories = ['manicure', 'pedicure', 'gel', 'acrylic', 'nail-art', 'other'];
  activeCategory = '';
  minDate = new Date();
  loadingSlots = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private techService: TechnicianService,
    private colorService: ColorService,
    private apptService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.step1 = this.fb.group({ serviceId: ['', Validators.required] });
    this.step3 = this.fb.group({ technicianId: ['', Validators.required] });
    this.step4 = this.fb.group({ date: ['', Validators.required], time: ['', Validators.required] });
    this.step5 = this.fb.group({
      customerName: ['', Validators.required],
      customerPhone: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.serviceService.getAll().subscribe(s => {
      this.services = s;
      this.filteredServices = s;
      this.route.queryParams.subscribe(params => {
        if (params['service']) {
          const found = s.find(x => x._id === params['service']);
          if (found) this.selectService(found);
        }
      });
    });
    this.techService.getAll().subscribe(t => {
      this.technicians = t;
      this.route.queryParams.subscribe(params => {
        if (params['technician']) this.step3.get('technicianId')?.setValue(params['technician']);
      });
    });
    this.colorService.getAll({ status: 'available' }).subscribe(c => this.availableColors = c);
  }

  filterServices(cat: string) {
    this.activeCategory = cat;
    this.filteredServices = cat ? this.services.filter(s => s.category === cat) : this.services;
  }

  selectService(s: Service) {
    if (!s) return;
    this.selectedService = s;
    this.step1.get('serviceId')?.setValue(s._id);
  }

  onDateChange() {
    const date = this.step4.get('date')?.value;
    const techId = this.step3.get('technicianId')?.value;
    const serviceId = this.step1.get('serviceId')?.value;
    if (!date || !techId || techId === 'auto' || !serviceId) return;
    this.loadingSlots = true;
    this.timeSlots = [];
    const dateStr = new Date(date).toISOString().split('T')[0];
    this.apptService.getAvailableSlots(techId, dateStr, serviceId).subscribe({
      next: r => { this.timeSlots = r.slots; this.loadingSlots = false; },
      error: () => this.loadingSlots = false
    });
  }

  confirm() {
    if (this.selectedColorId) {
      this.selectedColor = this.availableColors.find(c => c._id === this.selectedColorId) || null;
    }
    this.submitting = true;
    const payload = {
      serviceId: this.step1.get('serviceId')?.value,
      technicianId: this.step3.get('technicianId')?.value,
      nailColorId: this.selectedColorId || undefined,
      date: this.step4.get('date')?.value,
      time: this.step4.get('time')?.value,
      ...this.step5.value
    };
    this.apptService.book(payload).subscribe({
      next: appt => this.router.navigate(['/booking-confirmation'], { state: { appointment: appt, service: this.selectedService } }),
      error: err => {
        this.snackBar.open(err.error?.message || 'Booking failed. Please try again.', 'OK', { duration: 5000 });
        this.submitting = false;
      }
    });
  }
}
