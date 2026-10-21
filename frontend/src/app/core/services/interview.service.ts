import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Interview } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private readonly API_URL = `${environment.apiUrl}/interviews`;

  constructor(private http: HttpClient) {}

  getInterviews(filters?: { jobDriveId?: string; status?: string }): Observable<{ success: boolean; count: number; data: Interview[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.jobDriveId) params = params.set('jobDriveId', filters.jobDriveId);
      if (filters.status) params = params.set('status', filters.status);
    }
    return this.http.get<{ success: boolean; count: number; data: Interview[] }>(this.API_URL, { params, withCredentials: true });
  }

  getInterviewById(id: string): Observable<{ success: boolean; data: Interview }> {
    return this.http.get<{ success: boolean; data: Interview }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  scheduleInterview(data: {
    applicationId: string;
    roundName: string;
    interviewDate: string;
    interviewTime: string;
    mode: 'Online' | 'Offline';
    locationOrLink: string;
    instructions?: string;
  }): Observable<{ success: boolean; message: string; data: Interview }> {
    return this.http.post<{ success: boolean; message: string; data: Interview }>(this.API_URL, data, { withCredentials: true });
  }

  updateInterview(id: string, data: Partial<Interview>): Observable<{ success: boolean; message: string; data: Interview }> {
    return this.http.patch<{ success: boolean; message: string; data: Interview }>(`${this.API_URL}/${id}`, data, { withCredentials: true });
  }
}
