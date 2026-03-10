import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Technician } from '../models';

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<Technician[]>('/api/technicians'); }
  getById(id: string) { return this.http.get<Technician>(`/api/technicians/${id}`); }
  getMyProfile() { return this.http.get<Technician>('/api/technicians/my-profile'); }
  create(data: FormData) { return this.http.post<Technician>('/api/technicians', data); }
  update(id: string, data: FormData | object) { return this.http.put<Technician>(`/api/technicians/${id}`, data); }
  delete(id: string) { return this.http.delete(`/api/technicians/${id}`); }
}
