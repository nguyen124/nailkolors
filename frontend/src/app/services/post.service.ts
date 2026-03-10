import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../models';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<Post[]>('/api/posts'); }
  getAllAdmin() { return this.http.get<Post[]>('/api/posts/all'); }
  getById(id: string) { return this.http.get<Post>(`/api/posts/${id}`); }
  create(data: FormData) { return this.http.post<Post>('/api/posts', data); }
  update(id: string, data: FormData) { return this.http.put<Post>(`/api/posts/${id}`, data); }
  delete(id: string) { return this.http.delete(`/api/posts/${id}`); }
}
