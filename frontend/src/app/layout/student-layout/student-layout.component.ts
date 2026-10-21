import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div class="layout-wrapper">
      <!-- Student Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="brand-text">
            <h2>PlacePro</h2>
            <span>Student Portal</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">MY RECRUITMENT</div>
          <a routerLink="/student/dashboard" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-chart-line"></i>
            <span>Overview</span>
          </a>
          <a routerLink="/student/profile" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-user-circle"></i>
            <span>My Profile & Skills</span>
          </a>
          <a routerLink="/student/drives" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-building"></i>
            <span>Placement Drives</span>
          </a>
          <a routerLink="/student/applications" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-paper-plane"></i>
            <span>My Applications</span>
          </a>
          <a routerLink="/student/interviews" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-calendar-day"></i>
            <span>Interviews</span>
          </a>
          <a routerLink="/student/offers" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-trophy"></i>
            <span>Offers & Results</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.studentProfile?.fullName || currentUser?.email }}</span>
              <span class="user-roll badge badge-cyan">{{ currentUser?.studentProfile?.rollNumber || 'Student' }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="portal-badge">
              <i class="fa-solid fa-graduation-cap"></i>
              Class of {{ currentUser?.studentProfile?.batch || '2025' }}
            </span>
          </div>
          <div class="topbar-right">
            <button class="btn btn-secondary btn-sm" (click)="logout()">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <!-- Dynamic Page Router View -->
        <main class="page-container">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--slate-50);
    }

    .sidebar {
      width: 260px;
      background-color: var(--slate-900);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid var(--slate-800);
      z-index: 100;
    }

    .sidebar-brand {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #059669, #10b981);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: #ffffff;
    }
    .brand-text h2 {
      font-size: 1.25rem;
      color: #ffffff;
      line-height: 1.1;
    }
    .brand-text span {
      font-size: 0.75rem;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-section-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--slate-400);
      padding: 16px 12px 6px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--slate-300);
      font-size: 0.875rem;
      font-weight: 500;
      transition: var(--transition);
      text-decoration: none;
    }
    .nav-link i {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
      color: var(--slate-400);
      transition: var(--transition);
    }
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }
    .nav-link:hover i {
      color: var(--accent-emerald);
    }
    .nav-link.active {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }
    .nav-link.active i {
      color: #ffffff;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background-color: rgba(0, 0, 0, 0.15);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--slate-800);
      border: 1px solid var(--slate-700);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-emerald);
    }
    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-roll {
      align-self: flex-start;
      margin-top: 2px;
      font-size: 0.65rem;
      padding: 2px 6px;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      height: 64px;
      background-color: #ffffff;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 90;
    }
    .portal-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      background: var(--slate-100);
      color: var(--slate-700);
      padding: 5px 14px;
      border-radius: var(--radius-full);
      border: 1px solid var(--slate-200);
    }

    .page-container {
      padding: 32px;
      flex: 1;
    }

    @media (max-width: 900px) {
      .sidebar {
        width: 72px;
      }
      .brand-text, .nav-section-title, .nav-link span, .user-details {
        display: none;
      }
      .nav-link {
        justify-content: center;
        padding: 12px;
      }
    }
  `]
})
export class StudentLayoutComponent {
  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
