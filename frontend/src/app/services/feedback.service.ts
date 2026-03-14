import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Feedback {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private api = '/api/feedback';
  constructor(private http: HttpClient) {}

  private headers() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }) };
  }

  submit(data: Partial<Feedback>) { return this.http.post<{ message: string }>(this.api, data); }
  getAll() { return this.http.get<Feedback[]>(`${this.api}/all`, this.headers()); }
  update(id: string, data: Partial<Feedback>) { return this.http.put<Feedback>(`${this.api}/${id}`, data, this.headers()); }
  delete(id: string) { return this.http.delete(`${this.api}/${id}`, this.headers()); }
}
