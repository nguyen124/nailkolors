import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AnalyticsDashboard } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private http: HttpClient) {}
  getDashboard() { return this.http.get<AnalyticsDashboard>('/api/analytics/dashboard'); }
}
