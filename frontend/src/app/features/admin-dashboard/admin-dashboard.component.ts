import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboardData } from '../../core/models/dashboard.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Placement Analytics & Overview</h1>
          <p class="page-subtitle">Real-time recruitment statistics and student pipeline tracking</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/reports" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-file-csv"></i>
            Export Full Report
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading placement dashboard data..."></app-loading-spinner>

      <div *ngIf="!loading && data" class="dashboard-content">
        <!-- Top KPI Metric Cards -->
        <div class="grid-4 stats-row">
          <div class="stat-card">
            <div>
              <span class="stat-label">Total Registered</span>
              <div class="stat-value">{{ data.summary.totalStudents }}</div>
            </div>
            <div class="stat-icon">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
          </div>

          <div class="stat-card emerald">
            <div>
              <span class="stat-label">Students Placed</span>
              <div class="stat-value">{{ data.summary.placedStudents }}</div>
              <span class="badge badge-success" style="margin-top: 6px;">
                {{ data.summary.placementPercentage }}% Rate
              </span>
            </div>
            <div class="stat-icon">
              <i class="fa-solid fa-circle-check"></i>
            </div>
          </div>

          <div class="stat-card purple">
            <div>
              <span class="stat-label">Active Drives</span>
              <div class="stat-value">{{ data.summary.activeDrives }}</div>
            </div>
            <div class="stat-icon">
              <i class="fa-solid fa-bullhorn"></i>
            </div>
          </div>

          <div class="stat-card amber">
            <div>
              <span class="stat-label">Total Offers</span>
              <div class="stat-value">{{ data.summary.totalOffers }}</div>
            </div>
            <div class="stat-icon">
              <i class="fa-solid fa-trophy"></i>
            </div>
          </div>
        </div>

        <!-- Salary Package Highlights Banner -->
        <div class="card salary-card">
          <div class="salary-header">
            <div>
              <h3 class="card-title">Compensation & Package Metrics</h3>
              <p class="salary-sub">Calculated from verified candidate offer records</p>
            </div>
            <div class="package-tag badge badge-primary">
              <i class="fa-solid fa-indian-rupee-sign"></i> LPA Metrics
            </div>
          </div>
          <div class="grid-3 salary-stats">
            <div class="salary-metric">
              <span class="metric-title">Highest CTC Offered</span>
              <div class="metric-val text-emerald">₹ {{ data.packageStats.highestLPA }} <span class="unit">LPA</span></div>
            </div>
            <div class="salary-metric">
              <span class="metric-title">Average CTC</span>
              <div class="metric-val text-blue">₹ {{ data.packageStats.averageLPA }} <span class="unit">LPA</span></div>
            </div>
            <div class="salary-metric">
              <span class="metric-title">Lowest CTC</span>
              <div class="metric-val text-slate">₹ {{ data.packageStats.lowestLPA }} <span class="unit">LPA</span></div>
            </div>
          </div>
        </div>

        <div class="grid-2 details-row">
          <!-- Department-wise Placement Performance -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Department-Wise Placements</h3>
              <span class="badge badge-neutral">Class of 2025</span>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Registered</th>
                    <th>Placed</th>
                    <th>Placement %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let dept of data.departmentStats">
                    <td>
                      <strong>{{ dept.departmentCode }}</strong>
                      <div class="small-text">{{ dept.departmentName }}</div>
                    </td>
                    <td>{{ dept.totalStudents }}</td>
                    <td><span class="badge badge-success">{{ dept.placedStudents }}</span></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="progress-bar-container" style="width: 80px;">
                          <div class="progress-bar-fill" [style.width.%]="dept.placementPercentage"></div>
                        </div>
                        <span style="font-size: 0.8125rem; font-weight: 600;">{{ dept.placementPercentage }}%</span>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!data.departmentStats || data.departmentStats.length === 0">
                    <td colspan="4" style="text-align: center; color: #94a3b8;">No department records yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Company Offers Overview -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Top Recruiting Partners</h3>
              <a routerLink="/admin/companies" class="btn btn-outline btn-sm">View All</a>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Offers Issued</th>
                    <th>Avg Package</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let comp of data.companyStats">
                    <td>
                      <div class="company-name-cell">
                        <i class="fa-solid fa-building text-primary"></i>
                        <strong>{{ comp.companyName }}</strong>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-primary">{{ comp.totalOffers }} Offers</span>
                    </td>
                    <td>
                      <strong class="text-emerald">₹ {{ comp.avgPackage }} LPA</strong>
                    </td>
                  </tr>
                  <tr *ngIf="!data.companyStats || data.companyStats.length === 0">
                    <td colspan="3" style="text-align: center; color: #94a3b8;">No offers issued yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Applications Table -->
        <div class="card recent-apps-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Recent Placement Applications</h3>
              <p style="font-size: 0.8125rem; color: #64748b; margin-top: 2px;">
                Latest submissions through student portal
              </p>
            </div>
            <a routerLink="/admin/applications" class="btn btn-outline btn-sm">
              View All Applications
            </a>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Job Title & Company</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of data.recentApplications">
                  <td>
                    <strong>{{ app.student?.fullName }}</strong>
                    <div class="small-text">{{ app.student?.rollNumber }}</div>
                  </td>
                  <td>
                    <div><strong>{{ app.jobDrive?.title }}</strong></div>
                    <div class="small-text">{{ app.jobDrive?.company?.name }}</div>
                  </td>
                  <td>
                    <span class="badge badge-neutral">{{ app.student?.department?.code || 'N/A' }}</span>
                  </td>
                  <td>
                    <strong>{{ app.student?.cgpa }}</strong>
                  </td>
                  <td>
                    <span [class]="'badge badge-stage-' + app.currentStage.toLowerCase()">
                      {{ app.currentStage }}
                    </span>
                  </td>
                  <td>
                    {{ app.createdAt | date: 'mediumDate' }}
                  </td>
                </tr>
                <tr *ngIf="!data.recentApplications || data.recentApplications.length === 0">
                  <td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">
                    No recent applications submitted yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title {
      font-size: 1.5rem;
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--slate-500);
      margin-top: 4px;
    }
    .stats-row {
      margin-bottom: 24px;
    }
    .salary-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }
    .salary-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .salary-sub {
      font-size: 0.8125rem;
      color: var(--slate-500);
    }
    .salary-stats {
      padding-top: 8px;
    }
    .salary-metric {
      padding: 16px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }
    .metric-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--slate-500);
    }
    .metric-val {
      font-size: 1.625rem;
      font-weight: 800;
      font-family: var(--font-display);
      margin-top: 4px;
    }
    .text-emerald { color: #059669; }
    .text-blue { color: #2563eb; }
    .text-slate { color: #475569; }
    .unit {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--slate-500);
    }
    .details-row {
      margin-bottom: 24px;
    }
    .small-text {
      font-size: 0.75rem;
      color: var(--slate-500);
    }
    .company-name-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  data: AdminDashboardData | null = null;
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (res) => {
        this.data = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
