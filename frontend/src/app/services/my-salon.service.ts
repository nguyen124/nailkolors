import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { SalonOwner } from '../models';

@Injectable({ providedIn: 'root' })
export class MySalonService {
  private _profile = signal<SalonOwner | null>(null);
  profile = this._profile.asReadonly();

  constructor(private http: HttpClient) {}

  loadProfile() {
    return this.http.get<SalonOwner>('/api/my-salon/profile').pipe(
      tap(p => this._profile.set(p))
    );
  }

  getServices() { return this.http.get<any[]>('/api/my-salon/services'); }
  createService(data: FormData) { return this.http.post<any>('/api/my-salon/services', data); }
  updateService(id: string, data: FormData) { return this.http.put<any>(`/api/my-salon/services/${id}`, data); }
  deleteService(id: string) { return this.http.delete(`/api/my-salon/services/${id}`); }

  getColors(params?: any) { return this.http.get<any[]>('/api/my-salon/colors', { params: params || {} }); }
  createColor(data: FormData) { return this.http.post<any>('/api/my-salon/colors', data); }
  updateColor(id: string, data: FormData) { return this.http.put<any>(`/api/my-salon/colors/${id}`, data); }
  deleteColor(id: string) { return this.http.delete(`/api/my-salon/colors/${id}`); }

  getTechnicians() { return this.http.get<any[]>('/api/my-salon/technicians'); }
  createTechnician(data: FormData) { return this.http.post<any>('/api/my-salon/technicians', data); }
  updateTechnician(id: string, data: FormData) { return this.http.put<any>(`/api/my-salon/technicians/${id}`, data); }
  deleteTechnician(id: string) { return this.http.delete(`/api/my-salon/technicians/${id}`); }

  getPosts() { return this.http.get<any[]>('/api/my-salon/posts'); }
  createPost(data: FormData) { return this.http.post<any>('/api/my-salon/posts', data); }
  updatePost(id: string, data: FormData) { return this.http.put<any>(`/api/my-salon/posts/${id}`, data); }
  deletePost(id: string) { return this.http.delete(`/api/my-salon/posts/${id}`); }

  getAppointments(params?: any) { return this.http.get<any[]>('/api/my-salon/appointments', { params: params || {} }); }
  updateAppointment(id: string, data: any) { return this.http.put<any>(`/api/my-salon/appointments/${id}`, data); }

  getAnalytics() { return this.http.get<any>('/api/my-salon/analytics'); }
}
