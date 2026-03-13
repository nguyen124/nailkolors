import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NailColor } from '../models';

@Injectable({ providedIn: 'root' })
export class ColorService {
  constructor(private http: HttpClient) {}
  getAll(params?: { finishType?: string; status?: string; owner?: string }) {
    return this.http.get<NailColor[]>('/api/colors', { params: params || {} });
  }
  create(data: FormData) { return this.http.post<NailColor>('/api/colors', data); }
  update(id: string, data: FormData) { return this.http.put<NailColor>(`/api/colors/${id}`, data); }
  delete(id: string) { return this.http.delete(`/api/colors/${id}`); }
}
