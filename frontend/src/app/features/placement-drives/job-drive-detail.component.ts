import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JobDriveService } from '../../core/services/job-drive.service';
import { JobDrive } from '../../core/models/job-drive.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-job-drive-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="drive-detail-page">
      <div class="back-nav">
        <a routerLink="/admin/placement-drives" class="btn btn-secondary btn-sm">
          <i class="fa-solid fa-arrow-left"></i> Back to Drives
        </a>
      </div>

      <app-loading-spinner *ngIf="loading" message="Evaluating student eligibility against drive criteria..."></app-loading-spinner>

      <div *ngIf="!loading && drive" class="drive-container">
        <!-- Header Card -->
        <div class="card drive-summary-card">
          <div class="summary-top">
            <div>
              <span class="company-sub-title">{{ drive.company?.name }}</span>
              <h1 class="drive-main-title">{{ drive.title }}</h1>
            </div>
            <span class="badge" [ngClass]="drive.status === 'Active' ? 'badge-success' : 'badge-neutral'">
              {{ drive.status }}
            </span>
          </div>

          <p class="desc-para">{{ drive.description }}</p>

          <div class="grid-4 key-metrics">
            <div class="metric-item">
              <span class="m-label">CTC Package</span>
              <strong class="m-val text-emerald">₹ {{ drive.salaryPackage?.ctcLpa }} LPA</strong>
            </div>
            <div class="metric-item">
              <span class="m-label">Min CGPA</span>
              <strong class="m-val">{{ drive.eligibilityCriteria?.minCgpa }}</strong>
            </div>
            <div class="metric-item">
              <span class="m-label">Max Backlogs</span>
              <strong class="m-val">{{ drive.eligibilityCriteria?.maxBacklogs }}</strong>
            </div>
            <div class="metric-item">
              <span class="m-label">Deadline</span>
              <strong class="m-val">{{ drive.applicationDeadline | date: 'mediumDate' }}</strong>
            </div>
          </div>
        </div>

        <!-- Eligibility Classification Breakdown -->
        <div class="eligibility-analysis" *ngIf="drive.adminAnalytics">
          <div class="grid-2 analysis-kpi-row">
            <div class="card kpi-eligible">
              <div class="kpi-icon"><i class="fa-solid fa-circle-check"></i></div>
              <div>
                <span class="kpi-title">Eligible Candidates</span>
                <div class="kpi-number text-emerald">{{ drive.adminAnalytics.eligibleCount }}</div>
                <p class="kpi-sub">Students meeting all CGPA, backlog, and department cutoffs</p>
              </div>
            </div>

            <div class="card kpi-ineligible">
              <div class="kpi-icon"><i class="fa-solid fa-circle-xmark"></i></div>
              <div>
                <span class="kpi-title">Ineligible Candidates</span>
                <div class="kpi-number text-rose">{{ drive.adminAnalytics.ineligibleCount }}</div>
                <p class="kpi-sub">Students failing one or more drive criteria</p>
              </div>
            </div>
          </div>

          <div class="grid-2 tables-split">
            <!-- Eligible Students List -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title text-emerald"><i class="fa-solid fa-user-check"></i> Eligible Students</h3>
                <span class="badge badge-success">{{ drive.adminAnalytics.eligibleCount }} Total</span>
              </div>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student</th>
                      <th>Dept</th>
                      <th>CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of drive.adminAnalytics.eligibleStudentsSample">
                      <td><strong>{{ s.rollNumber }}</strong></td>
                      <td>{{ s.fullName }}</td>
                      <td><span class="badge badge-neutral">{{ s.department }}</span></td>
                      <td><strong class="text-emerald">{{ s.cgpa }}</strong></td>
                    </tr>
                    <tr *ngIf="drive.adminAnalytics.eligibleStudentsSample.length === 0">
                      <td colspan="4" style="text-align: center; color: #94a3b8;">No eligible students found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Ineligible Students List with Exact Reasons -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title text-rose"><i class="fa-solid fa-user-xmark"></i> Ineligible Students</h3>
                <span class="badge badge-danger">{{ drive.adminAnalytics.ineligibleCount }} Total</span>
              </div>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Academic Status</th>
                      <th>Ineligibility Reasons</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of drive.adminAnalytics.ineligibleStudentsSample">
                      <td>
                        <strong>{{ s.fullName }}</strong>
                        <div style="font-size: 0.75rem; color: #64748b;">{{ s.rollNumber }}</div>
                      </td>
                      <td>
                        <span class="badge badge-neutral">{{ s.department }}</span>
                        <div style="font-size: 0.8125rem; font-weight: 600; margin-top: 4px;">CGPA: {{ s.cgpa }}</div>
                      </td>
                      <td>
                        <ul class="reason-list">
                          <li *ngFor="let reason of s.reasons">{{ reason }}</li>
                        </ul>
                      </td>
                    </tr>
                    <tr *ngIf="drive.adminAnalytics.ineligibleStudentsSample.length === 0">
                      <td colspan="3" style="text-align: center; color: #94a3b8;">No ineligible students.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drive-detail-page { display: flex; flex-direction: column; gap: 20px; }
    .back-nav { margin-bottom: 6px; }
    .drive-summary-card { padding: 28px; }
    .summary-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .company-sub-title { font-size: 0.8125rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; }
    .drive-main-title { font-size: 1.5rem; color: #0f172a; margin-top: 2px; }
    .desc-para { color: #475569; font-size: 0.9375rem; line-height: 1.6; margin-bottom: 20px; }
    .key-metrics { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 16px; }
    .metric-item { display: flex; flex-direction: column; }
    .m-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .m-val { font-size: 1.25rem; color: #0f172a; margin-top: 2px; }
    .text-emerald { color: #059669; }
    .text-rose { color: #e11d48; }
    .analysis-kpi-row { margin-top: 20px; margin-bottom: 20px; }
    .kpi-eligible { display: flex; align-items: center; gap: 16px; border-left: 4px solid #10b981; }
    .kpi-ineligible { display: flex; align-items: center; gap: 16px; border-left: 4px solid #f43f5e; }
    .kpi-icon { font-size: 2rem; }
    .kpi-eligible .kpi-icon { color: #10b981; }
    .kpi-ineligible .kpi-icon { color: #f43f5e; }
    .kpi-title { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .kpi-number { font-size: 2.25rem; font-weight: 800; line-height: 1.1; font-family: var(--font-display); }
    .kpi-sub { font-size: 0.8125rem; color: #64748b; }
    .tables-split { gap: 20px; }
    .reason-list { padding-left: 16px; font-size: 0.75rem; color: #b91c1c; }
    .reason-list li { margin-bottom: 2px; }
  `]
})
export class JobDriveDetailComponent implements OnInit {
  drive: JobDrive | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private jobDriveService: JobDriveService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobDriveService.getJobDriveById(id).subscribe({
        next: (res) => {
          this.drive = res.data;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }
}
