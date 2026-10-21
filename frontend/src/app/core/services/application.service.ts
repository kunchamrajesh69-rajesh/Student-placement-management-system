import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, SelectionStage } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly API_URL = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyForDrive(jobDriveId: string): Observable<{ success: boolean; message: string; data: Application }> {
    return this.http.post<{ success: boolean; message: string; data: Application }>(
      this.API_URL,
      { jobDriveId },
      { withCredentials: true }
    );
  }

  getMyApplications(): Observable<{ success: boolean; count: number; data: Application[] }> {
    return this.http.get<{ success: boolean; count: number; data: Application[] }>(
      `${this.API_URL}/my-applications`,
      { withCredentials: true }
    );
  }

  getApplications(filters?: {
    jobDriveId?: string;
    stage?: string;
    search?: string;
    department?: string;
  }): Observable<{ success: boolean; count: number; data: Application[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.jobDriveId) params = params.set('jobDriveId', filters.jobDriveId);
      if (filters.stage) params = params.set('stage', filters.stage);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.department) params = params.set('department', filters.department);
    }
    return this.http.get<{ success: boolean; count: number; data: Application[] }>(this.API_URL, { params, withCredentials: true });
  }

  getApplicationById(id: string): Observable<{ success: boolean; data: Application }> {
    return this.http.get<{ success: boolean; data: Application }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  updateStage(
    id: string,
    stage: SelectionStage,
    remarks?: string
  ): Observable<{ success: boolean; message: string; data: Application }> {
    return this.http.patch<{ success: boolean; message: string; data: Application }>(
      `${this.API_URL}/${id}/stage`,
      { stage, remarks },
      { withCredentials: true }
    );
  }
}
