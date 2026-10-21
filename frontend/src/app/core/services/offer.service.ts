import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer, OfferStatus } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private readonly API_URL = `${environment.apiUrl}/offers`;

  constructor(private http: HttpClient) {}

  getOffers(): Observable<{ success: boolean; count: number; data: Offer[] }> {
    return this.http.get<{ success: boolean; count: number; data: Offer[] }>(this.API_URL, { withCredentials: true });
  }

  getOfferById(id: string): Observable<{ success: boolean; data: Offer }> {
    return this.http.get<{ success: boolean; data: Offer }>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  createOffer(data: {
    applicationId: string;
    designation: string;
    packageLPA: number;
    joiningDate?: string;
    offerLetterUrl?: string;
    remarks?: string;
  }): Observable<{ success: boolean; message: string; data: Offer }> {
    return this.http.post<{ success: boolean; message: string; data: Offer }>(this.API_URL, data, { withCredentials: true });
  }

  updateOfferStatus(id: string, status: OfferStatus, remarks?: string): Observable<{ success: boolean; message: string; data: Offer }> {
    return this.http.patch<{ success: boolean; message: string; data: Offer }>(
      `${this.API_URL}/${id}/status`,
      { status, remarks },
      { withCredentials: true }
    );
  }
}
