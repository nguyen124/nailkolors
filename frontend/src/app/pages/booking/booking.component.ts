import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
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
  imports: [
    CommonModule, ReactiveFormsModule, MatStepperModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatChipsModule, MatSnackBarModule
  ],
  template: `
    <div class="booking-hero">
      <div class="container">
        <h1>Book Your Appointment</h1>
        <p>Follow the steps below to schedule your visit</p>
      </div>
    </div>

    <section class="section">
      <div class="container booking-container">
        <mat-stepper [linear]="true" #stepper class="booking-stepper">

          <!-- STEP 1: Select Service -->
          <mat-step [completed]="!!selectedService">
            <ng-template matStepLabel>Select Service</ng-template>
            <h3 class="step-title">Choose a Service</h3>
            <div class="filter-chips">
              <button type="button" class="chip" [class.active]="activeCategory===''" (click)="filterServices('')">All</button>
              <button type="button" class="chip" *ngFor="let c of categories" [class.active]="activeCategory===c" (click)="filterServices(c)">{{c}}</button>
            </div>
            <p class="empty-hint" *ngIf="filteredServices.length === 0">No services found. Please check back later.</p>
            <div class="services-grid">
              <div class="service-option" *ngFor="let s of filteredServices"
                [class.selected]="selectedService?._id === s._id"
                (click)="selectService(s)">
                <div class="service-info">
                  <h4>{{s.name}}</h4>
                  <p>{{s.description | slice:0:90}}</p>
                  <div class="service-meta">
                    <span class="price">\${{s.price}}</span>
                    <span class="duration"><mat-icon>schedule</mat-icon> {{s.duration}} min</span>
                    <span class="category-tag">{{s.category}}</span>
                  </div>
                </div>
                <mat-icon class="check" *ngIf="selectedService?._id === s._id">check_circle</mat-icon>
              </div>
            </div>
            <div class="step-actions">
              <button mat-raised-button color="primary"
                [disabled]="!selectedService"
                (click)="selectedService && stepper.next()">
                Next <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- STEP 2: Technician + Date + Time -->
          <mat-step [stepControl]="step2">
            <ng-template matStepLabel>Technician & Schedule</ng-template>
            <form [formGroup]="step2">
              <h3 class="step-title">Select a Technician</h3>
              <p class="step-hint">
                <mat-icon>info</mat-icon>
                Showing <strong>{{technicians.length}}</strong> technician{{technicians.length !== 1 ? 's' : ''}}
                who specialize in <strong>{{selectedService?.category}}</strong>
                for <strong>{{selectedService?.name}}</strong>
              </p>

              <div class="tech-list">
                <!-- Auto assign option -->
                <div class="tech-card" [class.selected]="step2.get('technicianId')?.value === 'auto'"
                  (click)="selectTechnician('auto', null)">
                  <div class="tech-avatar auto">🎲</div>
                  <div class="tech-info">
                    <h4>Auto Assign</h4>
                    <p>Let us pick the best available technician for you</p>
                    <div class="work-days">
                      <span class="day-chip" *ngFor="let d of defaultWorkDays">{{d}}</span>
                    </div>
                  </div>
                  <mat-icon class="check" *ngIf="step2.get('technicianId')?.value === 'auto'">check_circle</mat-icon>
                </div>

                <!-- Individual technicians -->
                <div class="tech-card" *ngFor="let t of technicians"
                  [class.selected]="step2.get('technicianId')?.value === t._id"
                  (click)="selectTechnician(t._id, t)">
                  <div class="tech-avatar" [style.background-image]="t.photo ? 'url(' + t.photo + ')' : ''">
                    <span *ngIf="!t.photo">{{t.name.charAt(0)}}</span>
                  </div>
                  <div class="tech-info">
                    <h4>{{t.name}}</h4>
                    <p *ngIf="t.specialties?.length">{{t.specialties.join(' · ')}}</p>
                    <div class="work-days">
                      <span class="day-chip working" *ngFor="let h of getWorkingDays(t)">{{h}}</span>
                    </div>
                  </div>
                  <mat-icon class="check" *ngIf="step2.get('technicianId')?.value === t._id">check_circle</mat-icon>
                </div>
              </div>

              <!-- Date picker — shown after technician selected -->
              <ng-container *ngIf="step2.get('technicianId')?.value">
                <div class="schedule-section">
                  <h4 class="sub-title"><mat-icon>calendar_today</mat-icon> Choose a Date</h4>
                  <mat-form-field class="date-field">
                    <mat-label>Appointment Date</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate" (dateChange)="onDateChange()">
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>

                <!-- Time slots — shown after date selected -->
                <div class="schedule-section" *ngIf="step2.get('date')?.value">
                  <h4 class="sub-title"><mat-icon>access_time</mat-icon> Available Time Slots</h4>
                  <div class="loading-slots" *ngIf="loadingSlots"><mat-spinner diameter="30"></mat-spinner><span>Checking availability...</span></div>
                  <div *ngIf="!loadingSlots">
                    <div class="time-slots" *ngIf="timeSlots.length > 0">
                      <button type="button" class="time-slot"
                        *ngFor="let slot of timeSlots"
                        [class.selected]="step2.get('time')?.value === slot"
                        (click)="step2.get('time')?.setValue(slot)">{{slot}}</button>
                    </div>
                    <p class="no-slots" *ngIf="timeSlots.length === 0">
                      <mat-icon>event_busy</mat-icon> No available slots for this date. Please choose another date.
                    </p>
                  </div>
                </div>
              </ng-container>

              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="step2.invalid">
                  Next <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 3: Customer Info -->
          <mat-step [stepControl]="step3">
            <ng-template matStepLabel>Your Details</ng-template>
            <form [formGroup]="step3">
              <h3 class="step-title">Your Information</h3>

              <div class="info-grid">
                <mat-form-field class="full-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="customerName" placeholder="Jane Doe">
                  <mat-icon matPrefix>person</mat-icon>
                </mat-form-field>
                <mat-form-field class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="customerPhone" type="tel" placeholder="(555) 123-4567">
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>
                <mat-form-field class="full-width">
                  <mat-label>Email Address</mat-label>
                  <input matInput formControlName="customerEmail" type="email" placeholder="you@example.com">
                  <mat-icon matPrefix>email</mat-icon>
                </mat-form-field>
                <mat-form-field class="full-width">
                  <mat-label>Describe what you want to do</mat-label>
                  <textarea matInput formControlName="notes" rows="4"
                    placeholder="e.g. French tip with glitter, specific design, color combination, allergies..."></textarea>
                  <mat-icon matPrefix>edit_note</mat-icon>
                </mat-form-field>
              </div>

              <!-- Optional nail color -->
              <div class="color-section">
                <h4 class="sub-title"><mat-icon>palette</mat-icon> Nail Color <span class="optional">(Optional)</span></h4>
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
              </div>

              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="step3.invalid">
                  Review <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 4: Confirm -->
          <mat-step>
            <ng-template matStepLabel>Confirm</ng-template>
            <h3 class="step-title">Review Your Appointment</h3>
            <div class="summary-card card">
              <div class="summary-section">
                <h4 class="summary-label">Service</h4>
                <div class="summary-row">
                  <span>{{selectedService?.name}}</span>
                  <strong>\${{selectedService?.price}} · {{selectedService?.duration}} min</strong>
                </div>
              </div>
              <div class="summary-section">
                <h4 class="summary-label">Schedule</h4>
                <div class="summary-row">
                  <span>Technician</span>
                  <strong>{{selectedTechName}}</strong>
                </div>
                <div class="summary-row">
                  <span>Date</span>
                  <strong>{{step2.get('date')?.value | date:'fullDate'}}</strong>
                </div>
                <div class="summary-row">
                  <span>Time</span>
                  <strong>{{step2.get('time')?.value}}</strong>
                </div>
              </div>
              <div class="summary-section" *ngIf="selectedColorObj">
                <h4 class="summary-label">Nail Color</h4>
                <div class="summary-row">
                  <span>{{selectedColorObj.colorName}} · {{selectedColorObj.brand}}</span>
                  <div class="color-swatch-sm" [style.background]="selectedColorObj.colorCode"></div>
                </div>
              </div>
              <div class="summary-section">
                <h4 class="summary-label">Contact</h4>
                <div class="summary-row"><span>Name</span><strong>{{step3.get('customerName')?.value}}</strong></div>
                <div class="summary-row"><span>Phone</span><strong>{{step3.get('customerPhone')?.value}}</strong></div>
                <div class="summary-row"><span>Email</span><strong>{{step3.get('customerEmail')?.value}}</strong></div>
                <div class="summary-row" *ngIf="step3.get('notes')?.value">
                  <span>Description</span><strong>{{step3.get('notes')?.value}}</strong>
                </div>
              </div>
            </div>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
              <button mat-raised-button color="primary" (click)="confirm()" [disabled]="submitting" class="confirm-btn">
                <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
                <ng-container *ngIf="!submitting"><mat-icon>check</mat-icon> Confirm Booking</ng-container>
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
    .booking-container { max-width: 860px; }
    .booking-stepper { border-radius: var(--radius); box-shadow: var(--shadow); }
    .step-title { font-size: 1.5rem; margin: 24px 0 8px; color: var(--primary-dark); }
    .empty-hint { color: var(--text-muted); text-align: center; padding: 32px; font-style: italic; }
    .step-hint { display: flex; align-items: center; gap: 6px; color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem; }
    .step-hint mat-icon { font-size: 16px; height: 16px; width: 16px; color: var(--primary); }
    .sub-title { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; color: var(--primary-dark); margin: 24px 0 12px; }
    .sub-title mat-icon { font-size: 20px; height: 20px; width: 20px; color: var(--primary); }
    .optional { font-size: 0.85rem; color: var(--text-muted); font-weight: 400; }

    /* Service step */
    .filter-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .chip { padding: 6px 16px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; text-transform: capitalize; transition: all 0.2s; }
    .chip.active, .chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .service-option { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border: 2px solid #eee; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .service-option.selected { border-color: var(--primary); background: #fff0f5; }
    .service-option:hover { border-color: var(--primary-light); box-shadow: 0 4px 12px rgba(216,27,96,0.1); }
    .service-info h4 { margin-bottom: 4px; }
    .service-info p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
    .service-meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .service-meta .price { color: var(--primary); font-weight: 700; font-size: 1rem; }
    .service-meta .duration { display: flex; align-items: center; gap: 3px; font-size: 0.82rem; color: var(--text-muted); }
    .service-meta .duration mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .category-tag { font-size: 0.75rem; background: #fce4ec; color: var(--primary); padding: 2px 8px; border-radius: 50px; text-transform: capitalize; }
    .check { color: var(--primary); margin-left: 8px; flex-shrink: 0; }

    /* Technician step */
    .tech-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 8px; }
    .tech-card { display: flex; align-items: center; gap: 16px; padding: 16px; border: 2px solid #eee; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .tech-card.selected { border-color: var(--primary); background: #fff0f5; }
    .tech-card:hover { border-color: var(--primary-light); box-shadow: 0 4px 12px rgba(216,27,96,0.08); }
    .tech-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: white; background-size: cover; background-position: center; flex-shrink: 0; }
    .tech-avatar.auto { font-size: 1.6rem; background: linear-gradient(135deg, #ffd54f, #ff8f00); }
    .tech-info { flex: 1; min-width: 0; }
    .tech-info h4 { margin: 0 0 4px; }
    .tech-info p { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 8px; }
    .work-days { display: flex; flex-wrap: wrap; gap: 4px; }
    .day-chip { font-size: 0.72rem; padding: 2px 8px; border-radius: 50px; background: #f5f5f5; color: #999; }
    .day-chip.working { background: #e8f5e9; color: #2e7d32; }
    .tech-card mat-icon.check { margin-left: auto; color: var(--primary); flex-shrink: 0; }

    /* Schedule section */
    .schedule-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
    .date-field { width: 280px; }
    .time-slots { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .time-slot { padding: 8px 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .time-slot.selected { background: var(--primary); color: white; border-color: var(--primary); }
    .time-slot:hover:not(.selected) { border-color: var(--primary); color: var(--primary); }
    .loading-slots { display: flex; align-items: center; gap: 12px; color: var(--text-muted); padding: 12px 0; }
    .no-slots { display: flex; align-items: center; gap: 8px; color: var(--text-muted); padding: 12px 0; }
    .no-slots mat-icon { color: #e57373; }

    /* Info step */
    .info-grid { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
    .full-width { width: 100%; }
    .color-section { margin-top: 16px; }
    .colors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; max-height: 260px; overflow-y: auto; padding: 4px; }
    .color-option { display: flex; align-items: center; gap: 10px; padding: 10px; border: 2px solid #eee; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .color-option.selected { border-color: var(--primary); background: #fff0f5; }
    .color-swatch { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .color-swatch-sm { width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }
    .color-name { display: block; font-weight: 600; font-size: 0.82rem; }
    .color-brand { display: block; font-size: 0.72rem; color: var(--text-muted); }
    .color-details { flex: 1; min-width: 0; }

    /* Summary */
    .summary-card { padding: 0; overflow: hidden; margin-bottom: 24px; }
    .summary-section { padding: 16px 24px; border-bottom: 1px solid #f5f5f5; }
    .summary-section:last-child { border-bottom: none; }
    .summary-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); margin: 0 0 10px; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.95rem; }
    .summary-row span { color: var(--text-muted); }
    .summary-row strong { text-align: right; max-width: 60%; }
    .confirm-btn { display: flex; align-items: center; gap: 8px; }

    .step-actions { display: flex; gap: 16px; margin-top: 28px; padding: 16px 0; align-items: center; }
    @media (max-width: 600px) {
      .services-grid { grid-template-columns: 1fr; }
      .date-field { width: 100%; }
      .colors-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class BookingComponent implements OnInit {
  step2: FormGroup;
  step3: FormGroup;

  services: Service[] = [];
  filteredServices: Service[] = [];
  technicians: Technician[] = [];
  availableColors: NailColor[] = [];
  timeSlots: string[] = [];

  selectedService: Service | null = null;
  selectedColorId = '';
  selectedColorObj: NailColor | null = null;
  selectedTechName = 'Auto Assign';

  categories = ['manicure', 'pedicure', 'gel', 'acrylic', 'nail-art', 'other'];
  activeCategory = '';
  defaultWorkDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
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
    this.step2 = this.fb.group({
      technicianId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
    this.step3 = this.fb.group({
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

    this.colorService.getAll({ status: 'available' }).subscribe(c => this.availableColors = c);
  }

  filterServices(cat: string) {
    this.activeCategory = cat;
    this.filteredServices = cat ? this.services.filter(s => s.category === cat) : this.services;
  }

  selectService(s: Service) {
    this.selectedService = s;
    // Clear step2 without triggering validation errors
    this.step2.get('technicianId')?.setValue('');
    this.step2.get('date')?.setValue('');
    this.step2.get('time')?.setValue('');
    this.step2.markAsPristine();
    this.step2.markAsUntouched();
    this.timeSlots = [];
    this.selectedTechName = 'Auto Assign';
    // Load only technicians who have this service's category as a specialty
    this.techService.getAll(s.category).subscribe(t => this.technicians = t);
  }

  selectTechnician(id: string, tech: Technician | null) {
    this.step2.get('technicianId')?.setValue(id);
    this.step2.get('date')?.setValue('');
    this.step2.get('time')?.setValue('');
    this.timeSlots = [];
    this.selectedTechName = tech ? tech.name : 'Auto Assign';
  }

  getWorkingDays(t: Technician): string[] {
    if (!t.workingHours?.length) return [];
    return t.workingHours
      .filter((h: any) => h.isWorking)
      .map((h: any) => h.day.slice(0, 3));
  }

  onDateChange() {
    const date = this.step2.get('date')?.value;
    const techId = this.step2.get('technicianId')?.value;
    const serviceId = this.selectedService?._id;
    this.step2.get('time')?.setValue('');
    this.timeSlots = [];
    if (!date || !techId || techId === 'auto' || !serviceId) {
      // For auto-assign, generate default slots
      if (techId === 'auto' && date) this.generateDefaultSlots();
      return;
    }
    this.loadingSlots = true;
    const dateStr = this.toLocalDateStr(date);
    this.apptService.getAvailableSlots(techId, dateStr, serviceId).subscribe({
      next: r => { this.timeSlots = r.slots; this.loadingSlots = false; },
      error: () => { this.generateDefaultSlots(); this.loadingSlots = false; }
    });
  }

  private generateDefaultSlots() {
    this.timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
  }

  /** Format a Date object to YYYY-MM-DD using local time (not UTC) */
  private toLocalDateStr(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  confirm() {
    if (this.selectedColorId) {
      this.selectedColorObj = this.availableColors.find(c => c._id === this.selectedColorId) || null;
    }
    this.submitting = true;
    const date = this.step2.get('date')?.value;
    const payload = {
      serviceId: this.selectedService!._id,
      technicianId: this.step2.get('technicianId')?.value,
      nailColorId: this.selectedColorId || undefined,
      date: this.toLocalDateStr(date),
      time: this.step2.get('time')?.value,
      ...this.step3.value
    };
    this.apptService.book(payload).subscribe({
      next: appt => this.router.navigate(['/booking-confirmation'], {
        state: { appointment: appt, service: this.selectedService }
      }),
      error: err => {
        this.snackBar.open(err.error?.message || 'Booking failed. Please try again.', 'OK', { duration: 5000 });
        this.submitting = false;
      }
    });
  }
}
