import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, RouterLink],
  template: `
    <div class="page-hero"><div class="container"><h1>Blog & Promotions</h1><p>Latest news, tips, and special offers</p></div></div>
    <section class="section">
      <div class="container">
        <div class="blog-grid">
          <mat-card class="blog-card" *ngFor="let p of posts">
            <img mat-card-image [src]="p.image" [alt]="p.title" *ngIf="p.image" style="height:220px;object-fit:cover">
            <mat-card-content>
              <p class="post-date">{{p.publishDate | date:'longDate'}}</p>
              <h2>{{p.title}}</h2>
              <p>{{p.content | slice:0:200}}...</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-raised-button color="primary" [routerLink]="['/blog', p._id]">Read More</a>
            </mat-card-actions>
          </mat-card>
        </div>
        <p *ngIf="posts.length===0" style="text-align:center;color:var(--text-muted);margin-top:48px">No posts yet. Check back soon!</p>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, #4a0072, var(--primary)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .blog-card { border-radius: var(--radius) !important; }
    .post-date { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px; }
    .blog-card h2 { font-size: 1.2rem; margin-bottom: 12px; }
    @media (max-width: 900px) { .blog-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 600px) { .blog-grid { grid-template-columns: 1fr; } }
  `]
})
export class BlogComponent implements OnInit {
  posts: Post[] = [];
  constructor(private postService: PostService) {}
  ngOnInit() { this.postService.getAll().subscribe(p => this.posts = p); }
}
