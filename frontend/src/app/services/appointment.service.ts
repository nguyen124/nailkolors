import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getAvailableSlots(technicianId: string, date: string, serviceId: string) {
    return this.http.get<{ slots: string[] }>('/api/appointments/available-slots', {
      params: { technicianId, date, serviceId }
    });
  }

  lookup(params: { email?: string; phone?: string }) {
    return this.http.get<Appointment[]>('/api/appointments/lookup', { params });
  }

  book(data: Partial<Appointment>) {
    return this.http.post<Appointment>('/api/appointments', data);
  }

  getAll(params?: object) {
    return this.http.get<Appointment[]>('/api/appointments', { params: params as any });
  }

  update(id: string, data: Partial<Appointment>) {
    return this.http.put<Appointment>(`/api/appointments/${id}`, data);
  }

  cancel(id: string, customerEmail: string, customerPhone: string) {
    return this.http.patch(`/api/appointments/${id}/cancel`, { customerEmail, customerPhone });
  }

  delete(id: string) { return this.http.delete(`/api/appointments/${id}`); }
}
