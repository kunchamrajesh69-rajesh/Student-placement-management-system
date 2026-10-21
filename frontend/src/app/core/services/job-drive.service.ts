import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobDrive } from '../models/job-drive.model';

@Injectable({
  providedIn: 'root'
})
export class JobDriveService {
  private readonly API_URL = `${environment.apiUrl}/placement-drives`;

  constructor(private http: HttpClient) {}

  getJobDrives(filters?: { status?: string; company?: string; search?: string }): Observable<{ success: boolean; count: number; data: JobDrive[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.company) params = params.set('company', filters.company);
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http.get<{ success: boolean; count: number; data: JobDrive[] }>(this.API_URL, { params, withCredentials: true });
  }

  getJobDriveById(id: string): Observable<{ success: boolean; data: JobDrive }> {
    return this.http.get<{ success: boolean; data: JobDrive }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  getDriveEligibility(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.API_URL}/${id}/eligibility`, { withCredentials: true });
  }

  createJobDrive(data: Partial<JobDrive>): Observable<{ success: boolean; message: string; data: JobDrive }> {
    return this.http.post<{ success: boolean; message: string; data: JobDrive }>(this.API_URL, data, { withCredentials: true });
  }

  updateJobDrive(id: string, data: Partial<JobDrive>): Observable<{ success: boolean; message: string; data: JobDrive }> {
    return this.http.patch<{ success: boolean; message: string; data: JobDrive }>(`${this.API_URL}/${id}`, data, { withCredentials: true });
  }

  deleteJobDrive(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }
}
