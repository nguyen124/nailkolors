import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TechnicianService } from '../../services/technician.service';
import { Technician } from '../../models';

@Component({
  selector: 'app-technicians',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-hero"><div class="container"><h1>Meet Our Team</h1><p>Skilled technicians dedicated to your nail care</p></div></div>
    <section class="section">
      <div class="container">
        <div class="techs-grid">
          <div class="tech-card card" *ngFor="let t of technicians">
            <div class="tech-photo" [style.background-image]="t.photo ? 'url(' + t.photo + ')' : ''">
              <div class="photo-placeholder" *ngIf="!t.photo">{{t.name.charAt(0)}}</div>
            </div>
            <div class="tech-body">
              <h3>{{t.name}}</h3>
              <p class="bio">{{t.bio}}</p>
              <div class="specialties">
                <span class="tag" *ngFor="let s of t.specialties">{{s}}</span>
              </div>
              <div class="working-days">
                <div class="day-chip" *ngFor="let wh of t.workingHours" [class.working]="wh.isWorking" [class.off]="!wh.isWorking">
                  {{wh.day.slice(0,3)}}
                </div>
              </div>
              <a routerLink="/book" [queryParams]="{technician: t._id}" class="btn-primary book-btn">Book with {{t.name.split(' ')[0]}}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, #4a148c, #2d6e32); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .techs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .tech-photo { height: 250px; background: linear-gradient(135deg, var(--primary-light), var(--primary)); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
    .photo-placeholder { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; }
    .tech-body { padding: 24px; }
    .tech-body h3 { font-size: 1.3rem; margin-bottom: 8px; }
    .bio { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px; }
    .specialties { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tag { background: var(--primary-light); color: var(--primary-dark); padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; }
    .working-days { display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap; }
    .day-chip { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
    .day-chip.working { background: #e8f5e9; color: #2e7d32; }
    .day-chip.off { background: #f5f5f5; color: #bbb; }
    .book-btn { display: block; text-align: center; text-decoration: none; }
    @media (max-width: 900px) { .techs-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .techs-grid { grid-template-columns: 1fr; } }
  `]
})
export class TechniciansComponent implements OnInit {
  technicians: Technician[] = [];
  constructor(private techService: TechnicianService) {}
  ngOnInit() { this.techService.getAll().subscribe(t => this.technicians = t); }
}
