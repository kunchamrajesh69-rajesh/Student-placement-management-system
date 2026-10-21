import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly API_URL = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getCompanies(filters?: { search?: string; industry?: string; status?: string }): Observable<{ success: boolean; count: number; data: Company[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.industry) params = params.set('industry', filters.industry);
      if (filters.status) params = params.set('status', filters.status);
    }
    return this.http.get<{ success: boolean; count: number; data: Company[] }>(this.API_URL, { params, withCredentials: true });
  }

  getCompanyById(id: string): Observable<{ success: boolean; data: Company }> {
    return this.http.get<{ success: boolean; data: Company }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  createCompany(data: Partial<Company>): Observable<{ success: boolean; message: string; data: Company }> {
    return this.http.post<{ success: boolean; message: string; data: Company }>(this.API_URL, data, { withCredentials: true });
  }

  updateCompany(id: string, data: Partial<Company>): Observable<{ success: boolean; message: string; data: Company }> {
    return this.http.patch<{ success: boolean; message: string; data: Company }>(`${this.API_URL}/${id}`, data, { withCredentials: true });
  }

  deleteCompany(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }
}
