import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface AddOn {
  _id: string;
  name: string;
  price: number;
  description: string;
  applicableCategories: string[];
  isActive: boolean;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class AddOnService {
  private api = '/api/addons';
  constructor(private http: HttpClient) {}

  private headers() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }) };
  }

  getAll(category?: string) {
    const url = category ? `${this.api}?category=${encodeURIComponent(category)}` : this.api;
    return this.http.get<AddOn[]>(url);
  }

  getAllAdmin() {
    return this.http.get<AddOn[]>(`${this.api}/all`, this.headers());
  }

  create(data: Partial<AddOn>) {
    return this.http.post<AddOn>(this.api, data, this.headers());
  }

  update(id: string, data: Partial<AddOn>) {
    return this.http.put<AddOn>(`${this.api}/${id}`, data, this.headers());
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`, this.headers());
  }
}
