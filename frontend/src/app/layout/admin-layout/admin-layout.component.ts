import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div class="layout-wrapper">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="brand-text">
            <h2>PlacePro</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">CORE MANAGEMENT</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/students" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-user-graduate"></i>
            <span>Students</span>
          </a>
          <a routerLink="/admin/departments" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-building-columns"></i>
            <span>Departments</span>
          </a>
          <a routerLink="/admin/companies" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-briefcase"></i>
            <span>Companies</span>
          </a>
          <a routerLink="/admin/placement-drives" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-bullhorn"></i>
            <span>Placement Drives</span>
          </a>

          <div class="nav-section-title">SELECTION PIPELINE</div>
          <a routerLink="/admin/applications" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-file-signature"></i>
            <span>Applications</span>
          </a>
          <a routerLink="/admin/interviews" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-calendar-check"></i>
            <span>Interviews</span>
          </a>
          <a routerLink="/admin/offers" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-award"></i>
            <span>Offers & Results</span>
          </a>
          <a routerLink="/admin/reports" routerLinkActive="active" class="nav-link">
            <i class="fa-solid fa-file-csv"></i>
            <span>Reports & Analytics</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.email }}</span>
              <span class="user-role badge badge-primary">Placement Officer</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="portal-badge">College Placement Cell</span>
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
      background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
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
      color: var(--primary-400, #60a5fa);
    }
    .nav-link.active {
      background-color: var(--primary-600);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
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
      color: var(--primary-400, #60a5fa);
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
    .user-role {
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
      font-size: 0.8125rem;
      font-weight: 600;
      background: var(--slate-100);
      color: var(--slate-700);
      padding: 4px 12px;
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
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  get currentUser() {
    return this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
