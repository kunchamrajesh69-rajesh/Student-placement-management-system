import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly API_URL = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getPlacementReport(): Observable<any> {
    return this.http.get(`${this.API_URL}/placements`, { withCredentials: true });
  }

  downloadPlacementCSV(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/placements/export-csv`, {
      responseType: 'blob',
      withCredentials: true
    });
  }
}
