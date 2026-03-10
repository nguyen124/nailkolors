import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Service } from '../models';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  constructor(private http: HttpClient) {}
  getAll(category?: string) {
    const params = category ? { category } : {};
    return this.http.get<Service[]>('/api/services', { params });
  }
  create(data: FormData) { return this.http.post<Service>('/api/services', data); }
  update(id: string, data: FormData) { return this.http.put<Service>(`/api/services/${id}`, data); }
  delete(id: string) { return this.http.delete(`/api/services/${id}`); }
}
