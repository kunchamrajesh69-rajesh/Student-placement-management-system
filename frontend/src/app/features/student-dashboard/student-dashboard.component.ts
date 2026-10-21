import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { StudentDashboardData } from '../../core/models/dashboard.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="student-dashboard">
      <div class="page-header">
        <div>
          <h1 class="page-title">Welcome, {{ data?.profile?.fullName || 'Student' }}!</h1>
          <p class="page-subtitle">Track your campus placement journey, drive eligibility, and interview schedules</p>
        </div>
        <div class="status-indicator">
          <span class="status-label">Placement Status:</span>
          <span [class]="'badge badge-stage-' + (data?.profile?.placementStatus || 'unplaced').toLowerCase()">
            {{ data?.profile?.placementStatus || 'Unplaced' }}
          </span>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your recruitment profile..."></app-loading-spinner>

      <div *ngIf="!loading && data" class="content-body">
        <!-- Top Metrics Cards -->
        <div class="grid-4 stats-grid">
          <div class="card stat-card">
            <div>
              <span class="stat-label">Academic CGPA</span>
              <div class="stat-value text-blue">{{ data.profile.cgpa }}</div>
              <span class="badge badge-neutral" style="margin-top: 4px;">{{ data.profile.department.code }}</span>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          </div>

          <div class="card stat-card emerald">
            <div>
              <span class="stat-label">Active Drives</span>
              <div class="stat-value text-emerald">{{ data.activeDrivesCount }}</div>
              <span class="badge badge-success" style="margin-top: 4px;">Open for Application</span>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-briefcase"></i></div>
          </div>

          <div class="card stat-card purple">
            <div>
              <span class="stat-label">Applications</span>
              <div class="stat-value">{{ data.totalApplications }}</div>
              <span class="badge badge-purple" style="margin-top: 4px;">Submitted</span>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-paper-plane"></i></div>
          </div>

          <div class="card stat-card amber">
            <div>
              <span class="stat-label">Offers Received</span>
              <div class="stat-value">{{ data.offers.length }}</div>
              <span class="badge badge-warning" style="margin-top: 4px;">Placement Offers</span>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-trophy"></i></div>
          </div>
        </div>

        <!-- Profile Completeness Meter -->
        <div class="card profile-meter-card">
          <div class="meter-header">
            <div>
              <h3 class="card-title">Recruitment Profile Readiness</h3>
              <p class="meter-sub">A 100% complete profile increases corporate shortlisting visibility</p>
            </div>
            <div class="score-badge">{{ data.completenessScore }}% Complete</div>
          </div>
          <div class="progress-bar-container" style="height: 12px; margin-top: 12px;">
            <div class="progress-bar-fill" [style.width.%]="data.completenessScore"></div>
          </div>
          <div class="meter-checklist" *ngIf="data.completenessScore < 100">
            <span class="check-tip"><i class="fa-solid fa-lightbulb text-amber"></i> Tip:</span>
            <span *ngIf="!data.profile.resumeUrl" class="missing-item">Add your verified Resume link.</span>
            <span *ngIf="!data.profile.skills || data.profile.skills.length === 0" class="missing-item">Add your core technical skills.</span>
            <a routerLink="/student/profile" class="btn btn-outline btn-sm" style="margin-left: auto;">
              Complete Profile
            </a>
          </div>
        </div>

        <div class="grid-2 main-sections">
          <!-- Active Applications Tracking -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="fa-solid fa-paper-plane text-blue"></i> My Submissions</h3>
              <a routerLink="/student/applications" class="btn btn-outline btn-sm">View All</a>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Job Title & Company</th>
                    <th>Package</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let app of data.applications">
                    <td>
                      <strong>{{ app.jobDrive.title }}</strong>
                      <div class="sub-cell">{{ app.jobDrive.company.name }}</div>
                    </td>
                    <td>₹ {{ app.jobDrive.salaryPackage.ctcLpa }} LPA</td>
                    <td>
                      <span [class]="'badge badge-stage-' + app.currentStage.toLowerCase()">
                        {{ app.currentStage }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="data.applications.length === 0">
                    <td colspan="3" style="text-align: center; color: #94a3b8; padding: 24px;">
                      You have not applied to any drives yet. Check available drives!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Placement Offers Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title text-emerald"><i class="fa-solid fa-award"></i> Official Offers</h3>
              <a routerLink="/student/offers" class="btn btn-outline btn-sm">Manage Offers</a>
            </div>
            <div class="offers-list">
              <div *ngFor="let off of data.offers" class="offer-snippet">
                <div class="offer-left">
                  <div class="comp-icon"><i class="fa-solid fa-building"></i></div>
                  <div>
                    <h4 class="off-comp">{{ off.company.name }}</h4>
                    <span class="off-role">{{ off.designation }}</span>
                  </div>
                </div>
                <div class="offer-right">
                  <strong class="text-emerald">₹ {{ off.packageLPA }} LPA</strong>
                  <span [class]="'badge badge-stage-' + off.status.toLowerCase()">{{ off.status }}</span>
                </div>
              </div>

              <div *ngIf="data.offers.length === 0" class="no-offers">
                <i class="fa-regular fa-clock"></i>
                <p>No placement offers received yet. Prepare well for your upcoming assessments!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-dashboard { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; }
    .status-label { font-weight: 600; color: #64748b; }
    .profile-meter-card { padding: 22px; margin-top: 4px; }
    .meter-header { display: flex; align-items: center; justify-content: space-between; }
    .meter-sub { font-size: 0.8125rem; color: #64748b; }
    .score-badge { font-size: 1rem; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 4px 12px; border-radius: var(--radius-full); }
    .meter-checklist { display: flex; align-items: center; gap: 10px; margin-top: 14px; font-size: 0.8125rem; color: #475569; }
    .check-tip { font-weight: 700; }
    .missing-item { background: #fffbeb; color: #92400e; padding: 3px 8px; border-radius: var(--radius-sm); border: 1px solid #fef3c7; }
    .main-sections { margin-top: 20px; }
    .sub-cell { font-size: 0.75rem; color: #64748b; }
    .offers-list { display: flex; flex-direction: column; gap: 12px; }
    .offer-snippet { display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 1px solid #e2e8f0; border-radius: var(--radius-md); background: #f8fafc; }
    .offer-left { display: flex; align-items: center; gap: 12px; }
    .comp-icon { width: 38px; height: 38px; border-radius: var(--radius-md); background: #dbeafe; color: #1e40af; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .off-comp { font-size: 0.9375rem; color: #0f172a; }
    .off-role { font-size: 0.75rem; color: #64748b; }
    .offer-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .no-offers { text-align: center; padding: 32px 16px; color: #94a3b8; font-size: 0.875rem; }
    .no-offers i { font-size: 1.75rem; margin-bottom: 8px; display: block; }
    .text-emerald { color: #059669; }
    .text-blue { color: #2563eb; }
    .text-amber { color: #d97706; }
  `]
})
export class StudentDashboardComponent implements OnInit {
  data: StudentDashboardData | null = null;
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getStudentDashboard().subscribe({
      next: (res) => {
        this.data = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
