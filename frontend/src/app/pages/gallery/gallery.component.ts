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
          <!-- Finish type -->
          <div class="filter-row">
            <span class="filter-label">Finish</span>
            <div class="filter-chips">
              <button class="chip" [class.active]="activeFilter===''" (click)="filterColors('')">All</button>
              <button class="chip" *ngFor="let f of finishes" [class.active]="activeFilter===f" (click)="filterColors(f)">{{f}}</button>
            </div>
          </div>
          <!-- Brand -->
          <div class="filter-row" *ngIf="brands.length > 0">
            <span class="filter-label">Brand</span>
            <div class="filter-chips">
              <button class="chip" [class.active]="activeBrand===''" (click)="activeBrand='';applyFilters()">All</button>
              <button class="chip" *ngFor="let b of brands" [class.active]="activeBrand===b" (click)="activeBrand=b;applyFilters()">{{b}}</button>
            </div>
          </div>
          <!-- Color spectrum -->
          <div class="filter-row">
            <span class="filter-label">Color</span>
            <div class="filter-chips">
              <button class="spectrum-chip" [class.active]="activeSpectrum===''" (click)="activeSpectrum='';applyFilters()">All</button>
              <button class="spectrum-chip" *ngFor="let s of spectrums"
                [class.active]="activeSpectrum===s.key"
                (click)="activeSpectrum=s.key;applyFilters()">
                <span class="swatch-dot" [style.background]="s.gradient"></span>{{s.label}}
              </button>
            </div>
          </div>
          <!-- Stock -->
          <div class="filter-row">
            <span class="filter-label">Stock</span>
            <button class="chip" [class.active]="showAvailable" (click)="showAvailable=!showAvailable;applyFilters()">Available Only</button>
          </div>
        </div>

        <div class="colors-grid">
          <div class="color-card card" *ngFor="let c of pagedColors">
            <div class="color-swatch" [style.background]="c.image ? 'url(' + c.image + ') center/cover' : c.colorCode">
              <span class="status-badge" [class.available]="c.status==='available'" [class.out]="c.status==='out-of-stock'">
                {{c.status === 'available' ? '✓ In Stock' : '✗ Out of Stock'}}
              </span>
            </div>
            <div class="color-info">
              <div class="color-dot" [style.background-image]="'url(' + c.dotImage + ')'" style="background-size:cover;background-position:center"></div>
              <div>
                <h4>{{c.colorName}}</h4>
                <p>{{c.brand}}</p>
                <span class="finish-tag">{{c.finishType}}</span>
              </div>
            </div>
          </div>
        </div>
        <p class="empty" *ngIf="filteredColors.length === 0">No colors found.</p>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(1)">«</button>
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">‹</button>
          <button class="page-btn" *ngFor="let p of pageNumbers"
            [class.active]="p === currentPage"
            [class.ellipsis]="p === -1"
            [disabled]="p === -1"
            (click)="p !== -1 && goToPage(p)">
            {{p === -1 ? '…' : p}}
          </button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">›</button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(totalPages)">»</button>
          <span class="page-info">{{(currentPage - 1) * pageSize + 1}}–{{min(currentPage * pageSize, filteredColors.length)}} of {{filteredColors.length}}</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, #2d6e32, var(--primary)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .filter-bar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; padding: 20px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .filter-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); white-space: nowrap; min-width: 44px; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 6px 20px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; text-transform: capitalize; transition: all 0.2s; }
    .chip.active, .chip:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .colors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .color-swatch { height: 160px; position: relative; display: flex; align-items: flex-end; padding: 8px; }
    .status-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 50px; }
    .status-badge.available { background: rgba(46,125,50,0.9); color: white; }
    .status-badge.out { background: rgba(198,40,40,0.9); color: white; }
    .color-info { display: flex; align-items: center; gap: 12px; padding: 12px; }
    .color-dot { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;}
    .color-info h4 { font-size: 0.9rem; margin-bottom: 2px; }
    .color-info p { font-size: 0.8rem; color: var(--text-muted); }
    .finish-tag { font-size: 0.7rem; background: var(--primary-light); color: var(--primary-dark); padding: 2px 8px; border-radius: 50px; text-transform: capitalize; }
    .spectrum-chip { display: flex; align-items: center; gap: 6px; padding: 6px 16px; border: 2px solid var(--primary-light); border-radius: 50px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.88rem; }
    .spectrum-chip:hover, .spectrum-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
    .swatch-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid rgba(0,0,0,0.15); }
    .empty { text-align: center; color: var(--text-muted); margin-top: 48px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 40px; flex-wrap: wrap; }
    .page-btn { min-width: 36px; height: 36px; padding: 0 10px; border: 2px solid var(--primary-light); border-radius: 8px; background: white; color: var(--primary); cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .page-btn:hover:not([disabled]) { background: var(--primary); color: white; border-color: var(--primary); }
    .page-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
    .page-btn[disabled] { opacity: 0.35; cursor: default; }
    .page-btn.ellipsis { border-color: transparent; background: transparent; cursor: default; }
    .page-info { font-size: 0.82rem; color: var(--text-muted); margin-left: 8px; }
    @media (max-width: 600px) { .page-hero { padding: 48px 0; } .page-hero h1 { font-size: 2rem; } .colors-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); } .filter-row { flex-direction: column; align-items: flex-start; } }
    @media (max-width: 480px) { .page-hero h1 { font-size: 1.6rem; } .colors-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
  `]
})
export class GalleryComponent implements OnInit {
  colors: NailColor[] = [];
  filteredColors: NailColor[] = [];
  finishes = ['Shiny', 'Matte', 'Glitter', 'Cat Eyes', 'Holographic'];
  activeFilter = '';
  activeBrand = '';
  showAvailable = false;
  activeSpectrum = '';

  spectrums = [
    { key: 'red',     label: 'Reds',     gradient: 'linear-gradient(135deg,#e53935,#ff6b6b)' },
    { key: 'pink',    label: 'Pinks',    gradient: 'linear-gradient(135deg,#e91e8c,#ffb6c1)' },
    { key: 'purple',  label: 'Purples',  gradient: 'linear-gradient(135deg,#7b1fa2,#ce93d8)' },
    { key: 'blue',    label: 'Blues',    gradient: 'linear-gradient(135deg,#1565c0,#81d4fa)' },
    { key: 'green',   label: 'Greens',   gradient: 'linear-gradient(135deg,#2e7d32,#a5d6a7)' },
    { key: 'warm',    label: 'Warm',     gradient: 'linear-gradient(135deg,#e65100,#ffd54f)' },
    { key: 'neutral', label: 'Neutrals', gradient: 'linear-gradient(135deg,#5d4037,#f5f0ee)' },
  ];

  private hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return null;
    const r = parseInt(m[1], 16) / 255;
    const g = parseInt(m[2], 16) / 255;
    const b = parseInt(m[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: h * 360, s, l };
  }

  private getSpectrum(colorCode: string): string {
    const hsl = this.hexToHsl(colorCode);
    if (!hsl) return 'neutral';
    const { h, s, l } = hsl;
    // Low saturation or extreme lightness/darkness → neutral
    if (s < 0.18 || l < 0.12 || l > 0.92) return 'neutral';
    // Warm browns/nudes (orange hue, low-medium saturation)
    if (h >= 15 && h < 55 && s < 0.55) return 'neutral';
    if (h < 15 || h >= 345) return 'red';
    if (h >= 15 && h < 48) return 'warm';   // orange
    if (h >= 48 && h < 80) return 'warm';   // yellow/gold
    if (h >= 80 && h < 175) return 'green';
    if (h >= 175 && h < 258) return 'blue';
    if (h >= 258 && h < 300) return 'purple';
    if (h >= 300 && h < 345) return 'pink';
    return 'neutral';
  }

  readonly pageSize = 40;
  currentPage = 1;

  get brands(): string[] {
    const set = new Set(this.colors.map(c => c.brand).filter(Boolean));
    return Array.from(set).sort();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredColors.length / this.pageSize);
  }

  get pagedColors(): NailColor[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredColors.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push(-1);
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
      if (cur < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  min(a: number, b: number) { return Math.min(a, b); }

  constructor(private colorService: ColorService) {}

  ngOnInit() {
    this.colorService.getAll().subscribe(c => { this.colors = c; this.filteredColors = c; });
  }

  filterColors(finish: string) { this.activeFilter = finish; this.applyFilters(); }

  applyFilters() {
    this.filteredColors = this.colors.filter(c => {
      const finishMatch   = !this.activeFilter   || c.finishType === this.activeFilter;
      const brandMatch    = !this.activeBrand    || c.brand === this.activeBrand;
      const statusMatch   = !this.showAvailable  || c.status === 'available';
      const spectrumMatch = !this.activeSpectrum || this.getSpectrum(c.colorCode) === this.activeSpectrum;
      return finishMatch && brandMatch && statusMatch && spectrumMatch;
    });
    this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
