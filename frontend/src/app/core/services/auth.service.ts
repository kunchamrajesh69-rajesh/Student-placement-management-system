import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'spms_auth_token';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('spms_current_user');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('spms_current_user');
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken() || !!this.currentUserSubject.value;
  }

  public isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  public isStudent(): boolean {
    return this.currentUserSubject.value?.role === 'student';
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, { withCredentials: true }).pipe(
      tap((response) => {
        if (response.success && response.user) {
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
          }
          localStorage.setItem('spms_current_user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  fetchMe(): Observable<any> {
    return this.http.get<{ success: boolean; user: User }>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap((res) => {
        if (res.success && res.user) {
          localStorage.setItem('spms_current_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      }),
      catchError(() => {
        this.logoutLocal();
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.logoutLocal();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.logoutLocal();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  logoutLocal(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('spms_current_user');
    this.currentUserSubject.next(null);
  }

  updateCurrentUserProfile(studentData: any): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, studentProfile: studentData };
      this.currentUserSubject.next(updated);
      localStorage.setItem('spms_current_user', JSON.stringify(updated));
    }
  }
}
