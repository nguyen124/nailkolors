import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { AddOnService, AddOn } from '../../services/addon.service';
import { Service } from '../../models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink],
  template: `
    <div class="page-hero"><div class="container"><h1>Our Services</h1><p>Explore our full range of nail care services</p></div></div>
    <section class="section">
      <div class="container">
        <div class="filter-chips">
          <button class="chip" [class.active]="activeCategory === ''" (click)="filter('')">All</button>
          <button class="chip" *ngFor="let cat of categories" [class.active]="activeCategory === cat" (click)="filter(cat)">{{cat}}</button>
        </div>
        <div class="services-grid">
          <div class="service-card card" *ngFor="let s of filteredServices">
            <div class="service-img" [style.background-image]="s.image ? 'url(' + s.image + ')' : ''">
              <span class="badge badge-primary">{{s.category}}</span>
            </div>
            <div class="service-body">
              <h3>{{s.name}}</h3>
              <p>{{s.description}}</p>
              <div class="service-meta">
                <span class="price">\${{s.price}}</span>
                <span class="duration"><mat-icon>schedule</mat-icon> About {{s.duration}} min</span>
              </div>
              <a routerLink="/book" [queryParams]="{service: s._id}" class="btn-primary book-btn">Book This</a>
            </div>
          </div>
        </div>

        <div class="pedicure-note" *ngIf="activeCategory === 'Acrylic'">
          <mat-icon>info_outline</mat-icon>
          <span><strong>All the Acrylic come with the default one solid gel color, one week warranty, short nails and square shape, all other add-on options like special shape, long extra nail tip may come with extra cost — please see the add-ons menu section or ask us directly for more info.</strong></span>
        </div>
        <div class="pedicure-note" *ngIf="activeCategory === 'Manicure'">
          <mat-icon>info_outline</mat-icon>
          <span><strong>All the manicures come with the default one solid regular color, all other add-on options like gel color and design may come with extra cost. Please see the add-ons menu section or ask us directly for more info.</strong></span>
        </div>
        <div class="pedicure-note" *ngIf="activeCategory === 'Pedicure'">
          <mat-icon>info_outline</mat-icon>
          <span><strong>All the pedicures come with default one solid regular color, all other add-on options like gel color, french tip and other design may come with extra cost — please see the add-ons menu section or ask us directly for more info.</strong></span>
        </div>

        <!-- Add-Ons Section -->
        <div class="addons-section" *ngIf="visibleAddOns.length > 0">
          <h2 class="addons-title">
            <mat-icon>extension</mat-icon>
            Add-Ons & Extras
          </h2>
          <p class="addons-subtitle">Enhance your service with these optional add-ons</p>
          <div class="addons-grid">
            <div class="addon-card" *ngFor="let a of visibleAddOns">
              <div class="addon-info">
                <span class="addon-name">{{a.name}}</span>
                <span class="addon-desc" *ngIf="a.description">{{a.description}}</span>
                <div class="addon-tags" *ngIf="a.applicableCategories.length > 0">
                  <span class="addon-tag" *ngFor="let cat of a.applicableCategories">{{cat}}</span>
                </div>
              </div>
              <span class="addon-price">+\${{a.price}}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 48px; }
    .chip { padding: 8px 24px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; transition: all 0.2s; text-transform: capitalize; }
    .chip.active, .chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .service-img { height: 200px; background: linear-gradient(135deg, var(--primary-light), var(--primary)); background-size: cover; background-position: center; display: flex; align-items: flex-start; padding: 16px; }
    .service-body { padding: 20px; }
    .service-body h3 { margin-bottom: 8px; }
    .service-body p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px; }
    .service-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .price { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
    .duration { display: flex; align-items: center; gap: 4px; color: var(--text-muted); }
    .duration mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .pedicure-note { display: flex; align-items: flex-start; gap: 10px; background: #fff8f0; border-left: 4px solid var(--primary); border-radius: 6px; padding: 14px 18px; margin-bottom: 28px; color: #7a5c4e; font-size: 0.88rem; line-height: 1.6; }
    .pedicure-note mat-icon { font-size: 20px; height: 20px; width: 20px; color: var(--primary); flex-shrink: 0; margin-top: 1px; }
    .book-btn { display: block; text-align: center; text-decoration: none; }
    /* Add-Ons */
    .addons-section { margin-top: 64px; padding-top: 48px; border-top: 2px solid #f0e8f0; }
    .addons-title { display: flex; align-items: center; gap: 10px; font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--primary-dark); margin-bottom: 8px; }
    .addons-title mat-icon { font-size: 32px; height: 32px; width: 32px; color: var(--primary); }
    .addons-subtitle { color: var(--text-muted); margin-bottom: 32px; }
    .addons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .addon-card { display: flex; justify-content: space-between; align-items: flex-start; background: white; border: 1px solid #f0e8f0; border-radius: 12px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: box-shadow 0.2s; }
    .addon-card:hover { box-shadow: 0 4px 16px rgba(180,120,180,0.12); }
    .addon-info { display: flex; flex-direction: column; gap: 4px; }
    .addon-name { font-weight: 700; font-size: 1rem; color: var(--text-dark); }
    .addon-desc { font-size: 0.82rem; color: var(--text-muted); }
    .addon-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .addon-tag { background: #f3e5f5; color: var(--primary-dark); border-radius: 4px; padding: 2px 7px; font-size: 0.72rem; font-weight: 600; }
    .addon-price { font-size: 1.1rem; font-weight: 800; color: var(--primary); white-space: nowrap; margin-left: 16px; }
    @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .page-hero { padding: 48px 0; } .page-hero h1 { font-size: 2rem; } .services-grid { grid-template-columns: 1fr; } .addons-grid { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .page-hero h1 { font-size: 1.6rem; } }
  `]
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  allAddOns: AddOn[] = [];
  categories = ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing'];
  activeCategory = 'Acrylic';

  constructor(private serviceService: ServiceService, private addOnService: AddOnService) {}

  ngOnInit() {
    this.serviceService.getAll().subscribe(s => { this.services = s; this.filteredServices = s.filter(sv => sv.category === 'Acrylic'); });
    this.addOnService.getAll().subscribe(a => this.allAddOns = a);
  }

  get visibleAddOns(): AddOn[] {
    if (!this.activeCategory) return this.allAddOns;
    return this.allAddOns.filter(a =>
      a.applicableCategories.length === 0 || a.applicableCategories.includes(this.activeCategory)
    );
  }

  filter(cat: string) {
    this.activeCategory = cat;
    this.filteredServices = cat ? this.services.filter(s => s.category === cat) : this.services;
  }
}
