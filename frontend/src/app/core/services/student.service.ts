import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(filters?: {
    search?: string;
    department?: string;
    batch?: number;
    placementStatus?: string;
    minCgpa?: number;
    page?: number;
    limit?: number;
  }): Observable<{ success: boolean; data: Student[]; count: number; total: number; totalPages: number; currentPage: number }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.batch) params = params.set('batch', filters.batch.toString());
      if (filters.placementStatus) params = params.set('placementStatus', filters.placementStatus);
      if (filters.minCgpa !== undefined && filters.minCgpa !== null) params = params.set('minCgpa', filters.minCgpa.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<{ success: boolean; data: Student[]; count: number; total: number; totalPages: number; currentPage: number }>(
      this.API_URL,
      { params, withCredentials: true }
    );
  }

  getStudentById(id: string): Observable<{ success: boolean; data: Student }> {
    return this.http.get<{ success: boolean; data: Student }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  createStudent(data: any): Observable<{ success: boolean; message: string; data: Student }> {
    return this.http.post<{ success: boolean; message: string; data: Student }>(this.API_URL, data, { withCredentials: true });
  }

  updateStudent(id: string, data: Partial<Student>): Observable<{ success: boolean; message: string; data: Student }> {
    return this.http.patch<{ success: boolean; message: string; data: Student }>(`${this.API_URL}/${id}`, data, { withCredentials: true });
  }

  deleteStudent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }
}
