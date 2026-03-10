import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorService } from '../../services/color.service';
import { NailColor } from '../../models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-hero"><div class="container"><h1>Nail Color Gallery</h1><p>Browse our extensive collection of premium nail colors</p></div></div>
    <section class="section">
      <div class="container">
        <div class="filter-bar">
          <div class="filter-chips">
            <button class="chip" [class.active]="activeFilter===''" (click)="filterColors('')">All</button>
            <button class="chip" *ngFor="let f of finishes" [class.active]="activeFilter===f" (click)="filterColors(f)">{{f}}</button>
          </div>
          <button class="chip" [class.active]="showAvailable" (click)="showAvailable=!showAvailable;applyFilters()">Available Only</button>
        </div>
        <div class="colors-grid">
          <div class="color-card card" *ngFor="let c of filteredColors">
            <div class="color-swatch" [style.background]="c.image ? 'url(' + c.image + ') center/cover' : c.colorCode">
              <span class="status-badge" [class.available]="c.status==='available'" [class.out]="c.status==='out-of-stock'">
                {{c.status === 'available' ? '✓ In Stock' : '✗ Out of Stock'}}
              </span>
            </div>
            <div class="color-info">
              <div class="color-dot" [style.background]="c.colorCode"></div>
              <div>
                <h4>{{c.colorName}}</h4>
                <p>{{c.brand}}</p>
                <span class="finish-tag">{{c.finishType}}</span>
              </div>
            </div>
          </div>
        </div>
        <p class="empty" *ngIf="filteredColors.length === 0">No colors found.</p>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, #880e4f, var(--primary)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .filter-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 40px; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 6px 20px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; text-transform: capitalize; transition: all 0.2s; }
    .chip.active, .chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .colors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .color-swatch { height: 160px; position: relative; display: flex; align-items: flex-end; padding: 8px; }
    .status-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 50px; }
    .status-badge.available { background: rgba(46,125,50,0.9); color: white; }
    .status-badge.out { background: rgba(198,40,40,0.9); color: white; }
    .color-info { display: flex; align-items: center; gap: 12px; padding: 12px; }
    .color-dot { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; border: 2px solid rgba(0,0,0,0.1); }
    .color-info h4 { font-size: 0.9rem; margin-bottom: 2px; }
    .color-info p { font-size: 0.8rem; color: var(--text-muted); }
    .finish-tag { font-size: 0.7rem; background: var(--primary-light); color: var(--primary-dark); padding: 2px 8px; border-radius: 50px; text-transform: capitalize; }
    .empty { text-align: center; color: var(--text-muted); margin-top: 48px; }
  `]
})
export class GalleryComponent implements OnInit {
  colors: NailColor[] = [];
  filteredColors: NailColor[] = [];
  finishes = ['glossy', 'matte', 'glitter', 'shimmer', 'cream', 'gel'];
  activeFilter = '';
  showAvailable = false;
  constructor(private colorService: ColorService) {}
  ngOnInit() { this.colorService.getAll().subscribe(c => { this.colors = c; this.filteredColors = c; }); }
  filterColors(finish: string) { this.activeFilter = finish; this.applyFilters(); }
  applyFilters() {
    this.filteredColors = this.colors.filter(c => {
      const finishMatch = !this.activeFilter || c.finishType === this.activeFilter;
      const statusMatch = !this.showAvailable || c.status === 'available';
      return finishMatch && statusMatch;
    });
  }
}
