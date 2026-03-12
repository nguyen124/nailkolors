import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
  imports: [
    CommonModule, ReactiveFormsModule, MatStepperModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule
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
        <mat-stepper #stepper class="booking-stepper" animationDuration="200">

          <!-- ─── STEP 1: Select Service ─── -->
          <mat-step [completed]="!!selectedService">
            <ng-template matStepLabel>Select Service</ng-template>

            <h3 class="step-title">Choose a Service</h3>
            <div class="filter-chips">
              <button type="button" class="chip" [class.active]="activeCategory===''"
                (click)="filterServices('')">All</button>
              <button type="button" class="chip" *ngFor="let c of categories"
                [class.active]="activeCategory===c" (click)="filterServices(c)">{{c}}</button>
            </div>

            <p class="empty-hint" *ngIf="filteredServices.length === 0">
              No services found. Please check back later.
            </p>

            <div class="services-grid">
              <div class="service-card" *ngFor="let s of filteredServices"
                [class.selected]="selectedService?._id === s._id"
                [class.hovered]="hoveredServiceId === s._id"
                (mouseenter)="hoveredServiceId = s._id"
                (mouseleave)="hoveredServiceId = null"
                (click)="selectService(s)">
                <div class="service-info">
                  <h4>{{s.name}}</h4>
                  <p>{{hoveredServiceId === s._id ? s.description : (s.description | slice:0:90) + (s.description && s.description.length > 90 ? '…' : '')}}</p>
                  <div class="service-meta">
                    <span class="price">\${{s.price}}</span>
                    <span class="dur"><mat-icon>schedule</mat-icon>{{s.duration}} min</span>
                    <span class="cat-tag">{{s.category}}</span>
                  </div>
                </div>
                <mat-icon class="sel-check" *ngIf="selectedService?._id === s._id">check_circle</mat-icon>
              </div>
            </div>

            <div class="step-nav">
              <button mat-raised-button color="primary"
                [disabled]="!selectedService"
                (click)="selectedService && stepper.next()">
                Next <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- ─── STEP 2: Technician + Date + Time ─── -->
          <mat-step [completed]="step2Done">
            <ng-template matStepLabel>Technician &amp; Schedule</ng-template>

            <h3 class="step-title">Select a Technician</h3>
            <p class="step-hint">
              <mat-icon>info</mat-icon>
              {{technicians.length}} technician{{technicians.length !== 1 ? 's' : ''}}
              available for <strong>{{selectedService?.name}}</strong>
            </p>

            <div class="tech-list">
              <div class="tech-card" [class.selected]="selectedTechId === 'auto'"
                (click)="pickTechnician('auto', null)">
                <div class="tech-avatar auto">🎲</div>
                <div class="tech-info">
                  <h4>Auto Assign</h4>
                  <p>Let us pick the best available technician</p>
                </div>
                <mat-icon class="sel-check" *ngIf="selectedTechId === 'auto'">check_circle</mat-icon>
              </div>

              <div class="tech-card" *ngFor="let t of technicians"
                [class.selected]="selectedTechId === t._id"
                (click)="pickTechnician(t._id, t)">
                <div class="tech-avatar" [style.background-image]="t.photo ? 'url('+t.photo+')' : ''">
                  <span *ngIf="!t.photo">{{t.name.charAt(0)}}</span>
                </div>
                <div class="tech-info">
                  <h4>{{t.name}}</h4>
                  <p *ngIf="t.specialties?.length">{{t.specialties.join(' · ')}}</p>
                  <div class="work-days">
                    <span class="day-chip working" *ngFor="let d of getWorkingDays(t)">{{d}}</span>
                  </div>
                </div>
                <mat-icon class="sel-check" *ngIf="selectedTechId === t._id">check_circle</mat-icon>
              </div>
            </div>

            <!-- Date — shown after technician picked -->
            <div class="schedule-section" *ngIf="selectedTechId">
              <h4 class="sub-title"><mat-icon>calendar_today</mat-icon> Choose a Date</h4>
              <mat-form-field class="date-field">
                <mat-label>Appointment Date</mat-label>
                <input matInput [matDatepicker]="picker" [min]="minDate"
                  [value]="selectedDate"
                  (dateChange)="onDateChange($event.value)">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Time slots — shown after date picked -->
            <div class="schedule-section" *ngIf="selectedDate">
              <h4 class="sub-title"><mat-icon>access_time</mat-icon> Available Time Slots</h4>
              <div class="loading-slots" *ngIf="loadingSlots">
                <mat-spinner diameter="28"></mat-spinner><span>Checking availability…</span>
              </div>
              <ng-container *ngIf="!loadingSlots">
                <div class="time-slots" *ngIf="timeSlots.length > 0">
                  <button type="button" class="time-slot"
                    *ngFor="let slot of timeSlots"
                    [class.selected]="selectedTime === slot"
                    (click)="selectedTime = slot">{{slot}}</button>
                </div>
                <p class="no-slots" *ngIf="timeSlots.length === 0">
                  <mat-icon>event_busy</mat-icon> No slots on this date. Try another day.
                </p>
              </ng-container>
            </div>

            <div class="step-nav">
              <button mat-stroked-button (click)="stepper.previous()">
                <mat-icon>arrow_back</mat-icon> Back
              </button>
              <button mat-raised-button color="primary"
                [disabled]="!step2Done"
                (click)="step2Done && stepper.next()">
                Next <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- ─── STEP 3: Customer Info ─── -->
          <mat-step [completed]="infoForm.valid">
            <ng-template matStepLabel>Your Details</ng-template>

            <h3 class="step-title">Your Information</h3>
            <form [formGroup]="infoForm" class="info-form">
              <mat-form-field class="full-width">
                <mat-label>Full Name</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="customerName" placeholder="Jane Doe">
                <mat-error *ngIf="infoForm.get('customerName')?.hasError('required')">Name is required</mat-error>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Phone Number</mat-label>
                <mat-icon matPrefix>phone</mat-icon>
                <input matInput formControlName="customerPhone" type="tel" placeholder="(555) 123-4567">
                <mat-error *ngIf="infoForm.get('customerPhone')?.hasError('required')">Phone is required</mat-error>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Email Address</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput formControlName="customerEmail" type="email" placeholder="you@example.com">
                <mat-error *ngIf="infoForm.get('customerEmail')?.hasError('required')">Email is required</mat-error>
                <mat-error *ngIf="infoForm.get('customerEmail')?.hasError('email')">Enter a valid email</mat-error>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Describe what you want to do</mat-label>
                <mat-icon matPrefix>edit_note</mat-icon>
                <textarea matInput formControlName="notes" rows="3"
                  placeholder="e.g. French tip, glitter design, specific colors, allergies…"></textarea>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Reference URL to the sample image <span style="font-weight:400;font-size:0.85em">(optional)</span></mat-label>
                <mat-icon matPrefix>link</mat-icon>
                <input matInput formControlName="referenceUrl" type="url"
                  placeholder="https://www.pinterest.com/pin/576460821095578458... or any image URL">
              </mat-form-field>
              <div class="ref-preview" *ngIf="previewUrl">
                <img [src]="previewUrl" alt="Reference" class="ref-img"
                  (error)="refImgError = true" (load)="refImgError = false"
                  *ngIf="!refImgError">
                <div class="ref-link-only" *ngIf="refImgError">
                  <mat-icon>broken_image</mat-icon>
                  <a [href]="previewUrl" target="_blank" rel="noopener">View reference link</a>
                </div>
              </div>
            </form>

            <!-- Nail color browser: search + finish-type filter -->
            <div class="color-section" *ngIf="availableColors.length > 0">
              <h4 class="sub-title">
                <mat-icon>palette</mat-icon> Pick Colors
                <span class="optional">(optional · up to 10)</span>
                <span class="color-count-badge" *ngIf="selectedColorIds.length > 0">
                  {{selectedColorIds.length}} / 10
                </span>
              </h4>

              <!-- Finish-type filter chips -->
              <div class="filter-chips color-filter-chips">
                <button type="button" class="chip" [class.active]="colorFinishFilter === ''"
                  (click)="colorFinishFilter = ''; colorPage = 1">All Finishes</button>
                <button type="button" class="chip" *ngFor="let f of finishTypes"
                  [class.active]="colorFinishFilter === f"
                  (click)="colorFinishFilter = f; colorPage = 1">{{f}}</button>
              </div>

              <!-- Search box -->
              <div class="color-search-wrap">
                <mat-icon class="search-icon">search</mat-icon>
                <input class="color-search-input"
                  [value]="colorSearch"
                  (input)="colorSearch = $any($event.target).value; colorPage = 1"
                  placeholder="Search by color name or brand…"
                  type="text">
                <button type="button" class="clear-search" *ngIf="colorSearch"
                  (click)="colorSearch = ''; colorPage = 1">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <!-- Color results -->
              <div class="colors-grid" *ngIf="filteredColors.length > 0">
                <div class="color-card" *ngFor="let c of visibleColors"
                  [class.selected]="isColorSelected(c._id)"
                  [class.color-limit]="!isColorSelected(c._id) && selectedColorIds.length >= 10"
                  (click)="toggleColor(c._id)">
                  <div class="color-swatch" [style.background]="c.colorCode"></div>
                  <div class="color-text">
                    <span class="color-name">{{c.colorName}}</span>
                    <span class="color-brand">{{c.brand}}</span>
                  </div>
                  <mat-icon class="sel-check" *ngIf="isColorSelected(c._id)">check_circle</mat-icon>
                </div>
              </div>

              <!-- Pagination -->
              <div class="color-pagination" *ngIf="filteredColors.length > colorPageSize">
                <button type="button" class="page-btn" [disabled]="colorPage === 1"
                  (click)="colorPage = colorPage - 1">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <span class="page-info">
                  Page {{colorPage}} of {{colorTotalPages}}
                  <span class="page-total">({{filteredColors.length}} colors)</span>
                </span>
                <button type="button" class="page-btn" [disabled]="colorPage === colorTotalPages"
                  (click)="colorPage = colorPage + 1">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>

              <p class="color-empty" *ngIf="(colorSearch || colorFinishFilter) && filteredColors.length === 0">
                <mat-icon>search_off</mat-icon> No colors match. Try a different search or filter.
              </p>
              <p class="color-prompt" *ngIf="!colorSearch && !colorFinishFilter">
                <mat-icon>palette</mat-icon> Use the filters or type a name to browse our color collection.
              </p>

              <!-- Selected swatches strip -->
              <div class="selected-swatches" *ngIf="selectedColorIds.length > 0">
                <span class="swatch-strip-label">Selected:</span>
                <div class="swatch-strip-item" *ngFor="let id of selectedColorIds"
                  (click)="toggleColor(id)" title="Click to remove">
                  <div class="color-swatch-sm" [style.background]="getColor(id)?.colorCode"></div>
                  <span class="swatch-name">{{getColor(id)?.colorName}}</span>
                  <mat-icon class="remove-icon">close</mat-icon>
                </div>
              </div>
            </div>

            <div class="step-nav">
              <button mat-stroked-button (click)="stepper.previous()">
                <mat-icon>arrow_back</mat-icon> Back
              </button>
              <button mat-raised-button color="primary"
                [disabled]="infoForm.invalid"
                (click)="infoForm.valid && stepper.next()">
                Review <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- ─── STEP 4: Confirm ─── -->
          <mat-step>
            <ng-template matStepLabel>Confirm</ng-template>

            <h3 class="step-title">Review Your Appointment</h3>
            <div class="summary-card card">
              <div class="summary-section">
                <div class="summary-label">Service</div>
                <div class="summary-row">
                  <span>{{selectedService?.name}}</span>
                  <strong>\${{selectedService?.price}} · {{selectedService?.duration}} min</strong>
                </div>
              </div>
              <div class="summary-section">
                <div class="summary-label">Schedule</div>
                <div class="summary-row"><span>Technician</span><strong>{{selectedTechName}}</strong></div>
                <div class="summary-row"><span>Date</span><strong>{{selectedDate | date:'fullDate'}}</strong></div>
                <div class="summary-row"><span>Time</span><strong>{{selectedTime}}</strong></div>
              </div>
              <div class="summary-section" *ngIf="selectedColorIds.length > 0">
                <div class="summary-label">Nail Colors ({{selectedColorIds.length}})</div>
                <div class="summary-swatches">
                  <div class="summary-swatch-item" *ngFor="let id of selectedColorIds">
                    <div class="color-swatch-sm" [style.background]="getColor(id)?.colorCode"></div>
                    <span>{{getColor(id)?.colorName}}</span>
                  </div>
                </div>
              </div>
              <div class="summary-section" *ngIf="infoForm.get('referenceUrl')?.value">
                <div class="summary-label">Reference</div>
                <div class="summary-row">
                  <a [href]="infoForm.get('referenceUrl')?.value" target="_blank" rel="noopener" class="ref-url-link">View reference image</a>
                </div>
              </div>
              <div class="summary-section">
                <div class="summary-label">Contact</div>
                <div class="summary-row"><span>Name</span><strong>{{infoForm.get('customerName')?.value}}</strong></div>
                <div class="summary-row"><span>Phone</span><strong>{{infoForm.get('customerPhone')?.value}}</strong></div>
                <div class="summary-row"><span>Email</span><strong>{{infoForm.get('customerEmail')?.value}}</strong></div>
                <div class="summary-row" *ngIf="infoForm.get('notes')?.value">
                  <span>Description</span><strong>{{infoForm.get('notes')?.value}}</strong>
                </div>
              </div>
            </div>

            <div class="step-nav">
              <button mat-stroked-button (click)="stepper.previous()">
                <mat-icon>arrow_back</mat-icon> Back
              </button>
              <button mat-raised-button color="primary" (click)="confirm()" [disabled]="submitting">
                <mat-spinner diameter="18" *ngIf="submitting" style="display:inline-block;margin-right:8px"></mat-spinner>
                <mat-icon *ngIf="!submitting">check</mat-icon>
                {{submitting ? 'Booking…' : 'Confirm Booking'}}
              </button>
            </div>
          </mat-step>

        </mat-stepper>
      </div>
    </section>
  `,
  styles: [`
    .booking-hero { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 80px 0; text-align: center; }
    .booking-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .booking-container { max-width: 860px; }
    .booking-stepper { border-radius: var(--radius); box-shadow: var(--shadow); }
    .step-title { font-size: 1.5rem; margin: 24px 0 12px; color: var(--primary-dark); }
    .step-hint { display: flex; align-items: center; gap: 6px; color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem; }
    .step-hint mat-icon { font-size: 16px; height: 16px; width: 16px; color: var(--primary); flex-shrink: 0; }
    .sub-title { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; color: var(--primary-dark); margin: 24px 0 12px; }
    .sub-title mat-icon { font-size: 20px; height: 20px; width: 20px; color: var(--primary); }
    .optional { font-size: 0.85rem; color: var(--text-muted); font-weight: 400; }
    .empty-hint { color: var(--text-muted); text-align: center; padding: 32px; font-style: italic; }

    /* Service step */
    .filter-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .chip { padding: 6px 16px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; text-transform: capitalize; transition: all 0.2s; }
    .chip.active, .chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 24px; }
    .service-card { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
    .service-card.selected { border-color: var(--primary); background: var(--bg-light); }
    .service-card:hover, .service-card.hovered { border-color: var(--primary-light); box-shadow: 0 4px 16px rgba(60,144,66,0.15); z-index: 1; }
    .service-info { flex: 1; min-width: 0; }
    .service-info h4 { margin: 0 0 4px; font-size: 1rem; }
    .service-info p { font-size: 0.82rem; color: var(--text-muted); margin: 0 0 8px; line-height: 1.5; }
    .service-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .price { color: var(--primary); font-weight: 700; font-size: 1rem; }
    .dur { display: flex; align-items: center; gap: 3px; font-size: 0.8rem; color: var(--text-muted); }
    .dur mat-icon { font-size: 13px; height: 13px; width: 13px; }
    .cat-tag { font-size: 0.72rem; background: #e8f5e9; color: var(--primary); padding: 2px 8px; border-radius: 50px; text-transform: capitalize; }

    /* Technician step */
    .tech-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
    .tech-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .tech-card.selected { border-color: var(--primary); background: var(--bg-light); }
    .tech-card:hover { border-color: var(--primary-light); box-shadow: 0 3px 10px rgba(60,144,66,0.08); }
    .tech-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: white; background-size: cover; background-position: center; flex-shrink: 0; }
    .tech-avatar.auto { font-size: 1.5rem; background: linear-gradient(135deg, #ffd54f, #f57f17); }
    .tech-info { flex: 1; min-width: 0; }
    .tech-info h4 { margin: 0 0 2px; }
    .tech-info p { font-size: 0.83rem; color: var(--text-muted); margin: 0 0 6px; }
    .work-days { display: flex; flex-wrap: wrap; gap: 4px; }
    .day-chip.working { font-size: 0.7rem; padding: 2px 7px; border-radius: 50px; background: #e8f5e9; color: #2e7d32; }

    /* Date / time */
    .schedule-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eeeeee; }
    .date-field { width: 260px; }
    .time-slots { display: flex; flex-wrap: wrap; gap: 8px; }
    .time-slot { padding: 8px 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer; font-weight: 600; font-size: 0.88rem; transition: all 0.2s; }
    .time-slot.selected { background: var(--primary); color: white; border-color: var(--primary); }
    .time-slot:hover:not(.selected) { border-color: var(--primary); color: var(--primary); }
    .loading-slots { display: flex; align-items: center; gap: 10px; color: var(--text-muted); padding: 12px 0; }
    .no-slots { display: flex; align-items: center; gap: 8px; color: #e57373; padding: 12px 0; }

    /* Info step */
    .info-form { display: flex; flex-direction: column; gap: 2px; }
    .full-width { width: 100%; }

    /* Reference URL preview */
    .ref-preview { margin: -8px 0 12px; }
    .ref-img { max-height: 180px; max-width: 100%; border-radius: 10px; object-fit: contain; border: 1px solid #e0e0e0; display: block; }
    .ref-link-only { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--primary); }
    .ref-link-only mat-icon { font-size: 18px; height: 18px; width: 18px; }

    /* Color browser */
    .color-count-badge { margin-left: auto; background: var(--primary); color: white; font-size: 0.75rem; padding: 2px 10px; border-radius: 50px; font-weight: 600; }
    .color-section { margin-top: 8px; }
    .color-filter-chips { margin-bottom: 10px; }
    .color-search-wrap { position: relative; display: flex; align-items: center; margin-bottom: 12px; border: 2px solid #e0e0e0; border-radius: 10px; padding: 0 12px; background: white; transition: border-color 0.2s; }
    .color-search-wrap:focus-within { border-color: var(--primary); }
    .search-icon { color: var(--text-muted); font-size: 20px; height: 20px; width: 20px; flex-shrink: 0; margin-right: 8px; }
    .color-search-input { flex: 1; border: none; outline: none; font-size: 0.9rem; padding: 10px 0; background: transparent; }
    .clear-search { background: none; border: none; cursor: pointer; display: flex; align-items: center; color: var(--text-muted); padding: 4px; }
    .clear-search mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .color-empty { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-style: italic; padding: 16px 0; font-size: 0.9rem; }
    .color-empty mat-icon { font-size: 18px; height: 18px; width: 18px; color: #bdbdbd; }
    .color-prompt { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.88rem; padding: 16px 0 8px; }
    .color-prompt mat-icon { font-size: 18px; height: 18px; width: 18px; color: var(--primary-light); }
    .color-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 12px; padding: 8px 0; }
    .page-btn { background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; transition: all 0.2s; padding: 0; }
    .page-btn:hover:not([disabled]) { border-color: var(--primary); color: var(--primary); }
    .page-btn[disabled] { opacity: 0.35; cursor: not-allowed; }
    .page-btn mat-icon { font-size: 20px; height: 20px; width: 20px; }
    .page-info { font-size: 0.88rem; font-weight: 600; color: var(--primary-dark); }
    .page-total { font-weight: 400; color: var(--text-muted); }
    .colors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 4px; }
    .color-card { display: flex; align-items: center; gap: 10px; padding: 10px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .color-card.selected { border-color: var(--primary); background: var(--bg-light); }
    .color-card.color-limit { opacity: 0.45; cursor: not-allowed; }
    .color-text { flex: 1; min-width: 0; }
    .color-swatch { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .color-swatch-sm { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }
    .color-name { display: block; font-weight: 600; font-size: 0.8rem; }
    .color-brand { display: block; font-size: 0.7rem; color: var(--text-muted); }

    /* Selected swatches strip */
    .selected-swatches { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px; background: var(--bg-light); border-radius: 10px; }
    .swatch-strip-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
    .swatch-strip-item { display: flex; align-items: center; gap: 5px; background: white; border: 1px solid #e0e0e0; border-radius: 50px; padding: 3px 8px 3px 4px; cursor: pointer; transition: background 0.15s; }
    .swatch-strip-item:hover { background: #fce4ec; }
    .swatch-name { font-size: 0.75rem; font-weight: 600; }
    .remove-icon { font-size: 14px; height: 14px; width: 14px; color: #e57373; }

    /* Summary */
    .summary-card { padding: 0; overflow: hidden; margin-bottom: 24px; }
    .summary-section { padding: 14px 22px; border-bottom: 1px solid #f5f5f5; }
    .summary-section:last-child { border-bottom: none; }
    .summary-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); margin-bottom: 8px; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 0.93rem; }
    .summary-row span { color: var(--text-muted); }
    .summary-row strong { text-align: right; max-width: 58%; }
    .summary-swatches { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0; }
    .summary-swatch-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }
    .ref-url-link { color: var(--primary); font-size: 0.9rem; text-decoration: none; }
    .ref-url-link:hover { text-decoration: underline; }

    .sel-check { color: var(--primary); margin-left: auto; flex-shrink: 0; }
    .step-nav { display: flex; gap: 12px; align-items: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #f0f0f0; }

    @media (max-width: 600px) {
      .services-grid { grid-template-columns: 1fr; }
      .date-field { width: 100%; }
      .colors-grid { grid-template-columns: repeat(2, 1fr); }
      .booking-hero { padding: 48px 0; }
      .booking-hero h1 { font-size: 2rem; }
      .booking-container { padding: 0 8px; }
      .tech-card { flex-wrap: wrap; }
    }
    @media (max-width: 480px) {
      .booking-hero h1 { font-size: 1.6rem; }
      .step-nav { flex-wrap: wrap; }
      .step-nav button { width: 100%; }
    }
  `]
})
export class BookingComponent implements OnInit, OnDestroy {
  // Step 2 state
  selectedTechId = '';
  selectedTechName = 'Auto Assign';
  selectedDate: Date | null = null;
  selectedTime = '';
  timeSlots: string[] = [];
  loadingSlots = false;

  // Step 3 form
  infoForm: FormGroup;

  // Step 3 — reference URL debounced preview
  previewUrl = '';
  refImgError = false;
  private urlSub = new Subscription();

  // Step 3 — color browser state
  colorSearch = '';
  colorFinishFilter = '';
  colorPage = 1;
  readonly colorPageSize = 50;
  finishTypes = ['Shiny', 'Matte', 'Glitter', 'Cat Eyes', 'Holographic'];

  // Step 4 / shared
  selectedColorIds: string[] = [];
  submitting = false;

  // Data
  services: Service[] = [];
  filteredServices: Service[] = [];
  technicians: Technician[] = [];
  availableColors: NailColor[] = [];
  selectedService: Service | null = null;
  hoveredServiceId: string | null = null;

  categories = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing'];
  activeCategory = '';
  minDate = new Date();

  get step2Done(): boolean {
    return !!this.selectedTechId && !!this.selectedDate && !!this.selectedTime;
  }

  get filteredColors(): NailColor[] {
    const search = this.colorSearch.trim().toLowerCase();
    const finish = this.colorFinishFilter;
    if (!search && !finish) return [];
    return this.availableColors.filter(c => {
      const matchesFinish = !finish || c.finishType === finish;
      const matchesSearch = !search ||
        c.colorName.toLowerCase().includes(search) ||
        c.brand.toLowerCase().includes(search);
      return matchesFinish && matchesSearch;
    });
  }

  get visibleColors(): NailColor[] {
    const start = (this.colorPage - 1) * this.colorPageSize;
    return this.filteredColors.slice(start, start + this.colorPageSize);
  }

  get colorTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredColors.length / this.colorPageSize));
  }

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
    this.infoForm = this.fb.group({
      customerName:  ['', Validators.required],
      customerPhone: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      notes: [''],
      referenceUrl: ['']
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

    // Debounce reference URL input — wait 600 ms after typing stops, then update preview
    this.urlSub = this.infoForm.get('referenceUrl')!.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe((url: string) => {
      this.refImgError = false;
      this.previewUrl = url?.trim() || '';
    });
  }

  ngOnDestroy() {
    this.urlSub.unsubscribe();
  }

  filterServices(cat: string) {
    this.activeCategory = cat;
    this.filteredServices = cat ? this.services.filter(s => s.category === cat) : this.services;
  }

  selectService(s: Service) {
    this.selectedService = s;
    // Reset step 2 state
    this.selectedTechId = '';
    this.selectedTechName = 'Auto Assign';
    this.selectedDate = null;
    this.selectedTime = '';
    this.timeSlots = [];
    this.technicians = [];
    this.techService.getAll(s.category).subscribe(t => this.technicians = t);
  }

  pickTechnician(id: string, tech: Technician | null) {
    this.selectedTechId = id;
    this.selectedTechName = tech ? tech.name : 'Auto Assign';
    this.selectedDate = null;
    this.selectedTime = '';
    this.timeSlots = [];
  }

  getWorkingDays(t: Technician): string[] {
    return (t.workingHours || [])
      .filter((h: any) => h.isWorking)
      .map((h: any) => (h.day as string).slice(0, 3));
  }

  onDateChange(date: Date | null) {
    this.selectedDate = date;
    this.selectedTime = '';
    this.timeSlots = [];
    if (!date || !this.selectedTechId) return;

    if (this.selectedTechId === 'auto') {
      this.generateDefaultSlots();
      return;
    }

    this.loadingSlots = true;
    const dateStr = this.localDateStr(date);
    this.apptService.getAvailableSlots(this.selectedTechId, dateStr, this.selectedService!._id).subscribe({
      next: r => { this.timeSlots = r.slots; this.loadingSlots = false; },
      error: () => { this.generateDefaultSlots(); this.loadingSlots = false; }
    });
  }

  getColor(id: string): NailColor | undefined {
    return this.availableColors.find(c => c._id === id);
  }

  isColorSelected(id: string): boolean {
    return this.selectedColorIds.includes(id);
  }

  toggleColor(id: string) {
    const idx = this.selectedColorIds.indexOf(id);
    if (idx > -1) {
      this.selectedColorIds.splice(idx, 1);
    } else if (this.selectedColorIds.length < 10) {
      this.selectedColorIds.push(id);
    }
  }

  confirm() {
    this.submitting = true;
    const payload = {
      serviceId:     this.selectedService!._id,
      technicianId:  this.selectedTechId,
      nailColorIds:  this.selectedColorIds,
      date:          this.localDateStr(this.selectedDate!),
      time:          this.selectedTime,
      ...this.infoForm.value
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

  private generateDefaultSlots() {
    this.timeSlots = [
      '09:00','09:30','10:00','10:30','11:00','11:30',
      '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'
    ];
  }

  private localDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
