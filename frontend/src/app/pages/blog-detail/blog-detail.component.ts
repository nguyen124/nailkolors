import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { Post } from '../../models';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [MatButtonModule, CommonModule, RouterLink],
  template: `
    <div class="page-hero" *ngIf="post"><div class="container"><h1>{{post.title}}</h1><p>{{post.publishDate | date:'longDate'}}</p></div></div>
    <section class="section" *ngIf="post">
      <div class="container post-content">
        <img [src]="post.image" [alt]="post.title" class="post-img" *ngIf="post.image">
        <div class="prose">{{post.content}}</div>
        <a routerLink="/blog" mat-stroked-button color="primary" style="margin-top:32px">← Back to Blog</a>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, #4a0072, var(--primary)); color: white; padding: 80px 0; text-align: center; }
    .page-hero h1 { font-size: 2.5rem; margin-bottom: 8px; }
    .post-content { max-width: 800px; }
    .post-img { width: 100%; max-height: 400px; object-fit: cover; border-radius: var(--radius); margin-bottom: 32px; }
    .prose { font-size: 1.05rem; line-height: 1.9; white-space: pre-wrap; }
  `]
})
export class BlogDetailComponent implements OnInit {
  post: Post | null = null;
  constructor(private route: ActivatedRoute, private postService: PostService) {}
  ngOnInit() { this.route.params.subscribe(p => this.postService.getById(p['id']).subscribe(post => this.post = post)); }
}
