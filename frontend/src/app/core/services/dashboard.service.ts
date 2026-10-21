import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboardData, StudentDashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminDashboard(): Observable<{ success: boolean; data: AdminDashboardData }> {
    return this.http.get<{ success: boolean; data: AdminDashboardData }>(`${this.API_URL}/admin`, { withCredentials: true });
  }

  getStudentDashboard(): Observable<{ success: boolean; data: StudentDashboardData }> {
    return this.http.get<{ success: boolean; data: StudentDashboardData }>(`${this.API_URL}/student`, { withCredentials: true });
  }
}
