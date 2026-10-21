import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div class="login-wrapper">
      <div class="login-container">
        <!-- Brand Header -->
        <div class="login-header">
          <div class="brand-badge">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h1 class="portal-title">Student Placement Portal</h1>
          <p class="portal-subtitle">College Campus Recruitment & Career Management System</p>
        </div>

        <!-- Login Card -->
        <div class="card login-card">
          <h2 class="card-title-center">Sign In to Your Account</h2>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label class="form-label" for="email">Institutional Email</label>
              <div class="input-with-icon">
                <i class="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="form-control"
                  placeholder="e.g. admin@placement.edu"
                  [(ngModel)]="email"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  class="form-control"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block btn-lg"
              [disabled]="loading || !email || !password"
            >
              <i class="fa-solid fa-spinner fa-spin" *ngIf="loading"></i>
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading">Authenticating...</span>
            </button>
          </form>

          <!-- Quick Demo Credential Fillers -->
          <div class="demo-logins">
            <span class="demo-title">Quick Demo Logins</span>
            <div class="demo-buttons">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                (click)="fillCredentials('admin@placement.edu', 'AdminPassword123!')"
              >
                <i class="fa-solid fa-user-shield"></i>
                Placement Officer
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                (click)="fillCredentials('rajesh.cse@student.edu', 'StudentPassword123!')"
              >
                <i class="fa-solid fa-user-graduate"></i>
                Eligible Student (CSE)
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                (click)="fillCredentials('priya.ece@student.edu', 'StudentPassword123!')"
              >
                <i class="fa-solid fa-triangle-exclamation"></i>
                Student with Backlogs
              </button>
            </div>
          </div>
        </div>

        <!-- Portal Security Footer -->
        <div class="login-footer">
          <p><i class="fa-solid fa-shield-halved"></i> Secured with Role-Based Access Control & JWT</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1e3a8a 0%, #0f172a 100%);
      padding: 24px;
    }

    .login-container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .login-header {
      text-align: center;
      color: #ffffff;
    }

    .brand-badge {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
      border-radius: var(--radius-lg);
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #ffffff;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.4);
    }

    .portal-title {
      font-size: 1.75rem;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .portal-subtitle {
      font-size: 0.875rem;
      color: var(--slate-300);
    }

    .login-card {
      padding: 32px;
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    }

    .card-title-center {
      text-align: center;
      font-size: 1.25rem;
      margin-bottom: 24px;
      color: var(--slate-800);
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-icon i {
      position: absolute;
      left: 14px;
      color: var(--slate-400);
      font-size: 1rem;
    }

    .input-with-icon .form-control {
      padding-left: 42px;
    }

    .btn-block {
      width: 100%;
      margin-top: 8px;
    }

    .demo-logins {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px dashed var(--slate-200);
      text-align: center;
    }

    .demo-title {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--slate-400);
      margin-bottom: 12px;
    }

    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .login-footer {
      text-align: center;
      color: var(--slate-400);
      font-size: 0.8125rem;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  fillCredentials(email: string, pass: string) {
    this.email = email;
    this.password = pass;
  }

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.notificationService.success('Welcome back to the portal!', 'Login Successful');
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/student/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        const message =
          err?.error?.message ||
          err?.error?.error?.message ||
          'Unable to sign in. Please check your credentials or ensure the backend is running.';
        this.notificationService.error(message, 'Login Failed');
      }
    });
  }
}
