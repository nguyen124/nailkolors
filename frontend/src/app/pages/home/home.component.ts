import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../services/service.service';
import { PostService } from '../../services/post.service';
import { Service, Post } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule, CommonModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <p class="hero-subtitle">Welcome to</p>
        <h1 class="hero-title">Serenity Nails &amp; Spa</h1>
        <p class="hero-desc">Experience luxury nail care in a relaxing, welcoming environment. Our expert technicians are dedicated to making you look and feel your best.</p>
        <div class="hero-btns">
          <a routerLink="/book" class="btn-primary">Book Appointment</a>
          <a routerLink="/services" class="btn-outline">Our Services</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">500+</span><span class="stat-label">Happy Clients</span></div>
          <div class="stat"><span class="stat-num">50+</span><span class="stat-label">Nail Colors</span></div>
          <div class="stat"><span class="stat-num">10+</span><span class="stat-label">Expert Technicians</span></div>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-img-wrap">
          <img src="assets/hero.png" alt="Serenity Nails & Spa" class="hero-img">
          <div class="floating-card card-1">✨ Premium Quality</div>
          <div class="floating-card card-2">💅 Expert Care</div>
        </div>
      </div>
    </section>

    <section class="features section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item" *ngFor="let f of features">
            <div class="feature-icon">{{f.icon}}</div>
            <h3>{{f.title}}</h3>
            <p>{{f.desc}}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:#fff">
      <div class="container">
        <h2 class="section-title">Our Services</h2>
        <p class="section-subtitle">From classic manicures to elaborate nail art — we do it all</p>
        <div class="services-grid">
          <div class="service-card card" *ngFor="let s of services">
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
            </div>
          </div>
        </div>
        <div style="text-align:center"><a routerLink="/services" class="btn-primary">View All Services</a></div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2>Ready for Beautiful Nails?</h2>
        <p>Book your appointment today and let our experts take care of you</p>
        <a routerLink="/book" class="btn-large">Book Now — It's Easy!</a>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Latest News & Promotions</h2>
        <p class="section-subtitle">Stay up to date with our latest offers</p>
        <div class="blog-grid">
          <mat-card class="blog-card" *ngFor="let p of posts">
            <img mat-card-image [src]="p.image" [alt]="p.title" *ngIf="p.image" style="height:200px;object-fit:cover">
            <mat-card-content>
              <p class="post-date">{{p.publishDate | date:'mediumDate'}}</p>
              <h3>{{p.title}}</h3>
              <p>{{p.content | slice:0:120}}...</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" [routerLink]="['/blog', p._id]">Read More</a>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 90vh; align-items: center; background: linear-gradient(135deg, #f1f8f1 0%, #e8f5e9 100%); padding: 0 48px; gap: 48px; }
    .hero-subtitle { color: var(--primary); font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
    .hero-title { font-size: 4rem; color: var(--text-dark); line-height: 1.1; margin: 8px 0 24px; }
    .hero-desc { font-size: 1.1rem; color: var(--text-muted); line-height: 1.8; max-width: 480px; margin-bottom: 32px; }
    .hero-btns { display: flex; gap: 16px; margin-bottom: 48px; }
    .btn-outline { padding: 12px 32px; border: 2px solid var(--primary); color: var(--primary); border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
    .btn-outline:hover { background: var(--primary); color: white; }
    .hero-stats { display: flex; gap: 32px; }
    .stat { display: flex; flex-direction: column; }
    .stat-num { font-size: 2rem; font-weight: 700; color: var(--primary); font-family: 'Playfair Display', serif; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); }
    .hero-image { display: flex; justify-content: center; align-items: center; }
    .hero-img-wrap { position: relative; width: 420px; height: 480px; flex-shrink: 0; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; box-shadow: 0 30px 80px rgba(60,144,66,0.3); display: block; }
    .floating-card { position: absolute; background: white; border-radius: 12px; padding: 12px 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); font-weight: 600; color: var(--primary-dark); white-space: nowrap; }
    .card-1 { top: 20%; left: -15%; animation: float 3s ease-in-out infinite; }
    .card-2 { bottom: 20%; right: -10%; animation: float 3s ease-in-out infinite 1.5s; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
    .feature-item { text-align: center; padding: 32px 24px; background: white; border-radius: var(--radius); box-shadow: var(--shadow); }
    .feature-icon { font-size: 2.5rem; margin-bottom: 16px; }
    .feature-item h3 { margin-bottom: 8px; color: var(--primary-dark); }
    .feature-item p { color: var(--text-muted); font-size: 0.9rem; }
    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
    .service-card { border-radius: var(--radius); overflow: hidden; }
    .service-img { height: 180px; background: linear-gradient(135deg, var(--primary-light), var(--primary)); background-size: cover; background-position: center; display: flex; align-items: flex-start; padding: 16px; }
    .service-body { padding: 20px; }
    .service-body h3 { margin-bottom: 8px; }
    .service-body p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px; }
    .service-meta { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 1.4rem; font-weight: 700; color: var(--primary); }
    .duration { display: flex; align-items: center; gap: 4px; color: var(--text-muted); font-size: 0.85rem; }
    .duration mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .cta-section { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 80px 48px; text-align: center; }
    .cta-section h2 { font-size: 2.5rem; margin-bottom: 16px; }
    .cta-section p { font-size: 1.1rem; margin-bottom: 32px; opacity: 0.9; }
    .btn-large { display: inline-block; background: white; color: var(--primary) !important; padding: 16px 48px; border-radius: 50px; text-decoration: none; font-size: 1.1rem; font-weight: 700; transition: all 0.3s; }
    .btn-large:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .blog-card { border-radius: var(--radius) !important; }
    .post-date { color: var(--text-muted); font-size: 0.8rem; margin-bottom: 8px; }
    .blog-card h3 { margin-bottom: 8px; font-size: 1.1rem; }
    @media (max-width: 1024px) { .hero { grid-template-columns: 1fr; text-align: center; padding: 48px 24px; } .hero-image { display: none; } .hero-desc { max-width: 100%; } .hero-btns { justify-content: center; } .hero-stats { justify-content: center; } .features-grid { grid-template-columns: repeat(2, 1fr); } .services-grid { grid-template-columns: repeat(2, 1fr); } .blog-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .hero { padding: 40px 16px; min-height: auto; } .hero-title { font-size: 2.2rem; } .hero-btns { flex-direction: column; align-items: center; } .hero-stats { gap: 16px; flex-wrap: wrap; justify-content: center; } .features-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } .services-grid { grid-template-columns: 1fr; } .blog-grid { grid-template-columns: 1fr; } .cta-section { padding: 48px 16px; } .cta-section h2 { font-size: 1.8rem; } .btn-large { padding: 14px 32px; font-size: 1rem; } }
    @media (max-width: 400px) { .hero-title { font-size: 1.8rem; } .features-grid { grid-template-columns: 1fr; } .hero-stats { flex-direction: column; align-items: center; gap: 12px; } }
  `]
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  posts: Post[] = [];
  features = [
    { icon: '✨', title: 'Premium Quality', desc: 'We use only the best nail products and tools' },
    { icon: '💅', title: 'Expert Technicians', desc: 'Our team is highly trained and experienced' },
    { icon: '🌸', title: 'Relaxing Atmosphere', desc: 'Enjoy a calm and luxurious experience' },
    { icon: '📅', title: 'Easy Booking', desc: 'Book online in minutes, no account needed' }
  ];
  constructor(private serviceService: ServiceService, private postService: PostService) {}
  ngOnInit() {
    this.serviceService.getAll().subscribe(s => this.services = s.slice(0, 6));
    this.postService.getAll().subscribe(p => this.posts = p.slice(0, 3));
  }
}
