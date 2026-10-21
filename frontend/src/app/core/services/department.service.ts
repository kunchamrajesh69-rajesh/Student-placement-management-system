import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly API_URL = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<{ success: boolean; count: number; data: Department[] }> {
    return this.http.get<{ success: boolean; count: number; data: Department[] }>(this.API_URL, { withCredentials: true });
  }

  createDepartment(data: Partial<Department>): Observable<{ success: boolean; message: string; data: Department }> {
    return this.http.post<{ success: boolean; message: string; data: Department }>(this.API_URL, data, { withCredentials: true });
  }

  updateDepartment(id: string, data: Partial<Department>): Observable<{ success: boolean; message: string; data: Department }> {
    return this.http.patch<{ success: boolean; message: string; data: Department }>(`${this.API_URL}/${id}`, data, { withCredentials: true });
  }

  deleteDepartment(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }
}
