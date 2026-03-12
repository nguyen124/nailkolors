import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';
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
                <span class="duration"><mat-icon>schedule</mat-icon> {{s.duration}} min</span>
              </div>
              <a routerLink="/book" [queryParams]="{service: s._id}" class="btn-primary book-btn">Book This</a>
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
    .book-btn { display: block; text-align: center; text-decoration: none; }
    @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .page-hero { padding: 48px 0; } .page-hero h1 { font-size: 2rem; } .services-grid { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .page-hero h1 { font-size: 1.6rem; } }
  `]
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories = ['manicure', 'pedicure', 'gel', 'acrylic', 'nail-art', 'other'];
  activeCategory = '';
  constructor(private serviceService: ServiceService) {}
  ngOnInit() { this.serviceService.getAll().subscribe(s => { this.services = s; this.filteredServices = s; }); }
  filter(cat: string) { this.activeCategory = cat; this.filteredServices = cat ? this.services.filter(s => s.category === cat) : this.services; }
}
