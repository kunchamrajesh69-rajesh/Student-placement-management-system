import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobDriveService } from '../../core/services/job-drive.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { JobDrive } from '../../core/models/job-drive.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-student-drives',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="drives-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Campus Recruitment Drives</h1>
          <p class="page-subtitle">Verified opportunities evaluated in real-time against your academic eligibility</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading drives and calculating eligibility..."></app-loading-spinner>

      <div *ngIf="!loading && drives.length > 0" class="grid-2 drives-grid">
        <div *ngFor="let drive of drives" class="card drive-card" [class.ineligible-card]="drive.studentContext && !drive.studentContext.isEligible">
          <div class="drive-header">
            <div>
              <span class="company-badge">{{ drive.company.name }}</span>
              <h3 class="drive-title">{{ drive.title }}</h3>
            </div>
            <!-- Eligibility Status Badge -->
            <div *ngIf="drive.studentContext">
              <span *ngIf="drive.studentContext.isEligible" class="badge badge-success">
                <i class="fa-solid fa-circle-check"></i> Eligible
              </span>
              <span *ngIf="!drive.studentContext.isEligible" class="badge badge-danger">
                <i class="fa-solid fa-circle-xmark"></i> Ineligible
              </span>
            </div>
          </div>

          <p class="drive-desc">{{ drive.description }}</p>

          <div class="metrics-strip">
            <div class="metric-item">
              <span class="m-label">CTC Package</span>
              <strong class="m-val text-emerald">₹ {{ drive.salaryPackage.ctcLpa }} LPA</strong>
            </div>
            <div class="metric-item">
              <span class="m-label">Min CGPA</span>
              <strong class="m-val">{{ drive.eligibilityCriteria.minCgpa }}</strong>
            </div>
            <div class="metric-item">
              <span class="m-label">Max Backlogs</span>
              <strong class="m-val">{{ drive.eligibilityCriteria.maxBacklogs }}</strong>
            </div>
            <div class="metric-item">
              <span class="m-label">Deadline</span>
              <strong class="m-val">{{ drive.applicationDeadline | date: 'mediumDate' }}</strong>
            </div>
          </div>

          <!-- Eligibility Details or Warning -->
          <div *ngIf="drive.studentContext && !drive.studentContext.isEligible" class="ineligibility-warning">
            <div class="warning-title"><i class="fa-solid fa-triangle-exclamation"></i> Eligibility Reasons:</div>
            <ul class="reasons-list">
              <li *ngFor="let reason of drive.studentContext.eligibilityReasons">{{ reason }}</li>
            </ul>
          </div>

          <div class="drive-footer">
            <div class="footer-left">
              <span class="badge badge-neutral"><i class="fa-solid fa-location-dot"></i> {{ drive.location }}</span>
            </div>

            <!-- Application Action Buttons -->
            <div class="footer-right">
              <!-- Already applied state -->
              <span *ngIf="drive.studentContext?.hasApplied" class="badge badge-primary applied-badge">
                <i class="fa-solid fa-circle-check"></i> Applied: {{ drive.studentContext?.applicationStage }}
              </span>

              <!-- Deadline passed state -->
              <span *ngIf="!drive.studentContext?.hasApplied && drive.studentContext?.isDeadlinePassed" class="badge badge-neutral">
                Deadline Expired
              </span>

              <!-- Ineligible state -->
              <button
                *ngIf="!drive.studentContext?.hasApplied && !drive.studentContext?.isDeadlinePassed && !drive.studentContext?.isEligible"
                class="btn btn-secondary btn-sm"
                disabled
              >
                Ineligible to Apply
              </button>

              <!-- Eligible & Can Apply -->
              <button
                *ngIf="drive.studentContext?.canApply"
                class="btn btn-primary btn-sm"
                [disabled]="applyingId === drive._id"
                (click)="apply(drive)"
              >
                <i class="fa-solid fa-spinner fa-spin" *ngIf="applyingId === drive._id"></i>
                <i class="fa-solid fa-paper-plane" *ngIf="applyingId !== drive._id"></i>
                <span>Apply Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && drives.length === 0"
        icon="fa-solid fa-bullhorn"
        title="No placement drives available"
        message="There are currently no active campus placement drives. Check back soon!"
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .drives-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .drive-card { display: flex; flex-direction: column; justify-content: space-between; }
    .ineligible-card { border-color: #fecdd3; background: #fff5f5; }
    .drive-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .company-badge { font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px; }
    .drive-title { font-size: 1.125rem; color: #0f172a; }
    .drive-desc { font-size: 0.8125rem; color: #64748b; margin-bottom: 16px; line-height: 1.5; }
    .metrics-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .metric-item { background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 8px 10px; text-align: center; }
    .m-label { font-size: 0.6875rem; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; }
    .m-val { font-size: 0.9375rem; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .text-emerald { color: #059669; }
    .ineligibility-warning { background: #fff1f2; border: 1px solid #ffe4e6; border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; }
    .warning-title { font-size: 0.75rem; font-weight: 700; color: #be123c; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .reasons-list { padding-left: 18px; font-size: 0.75rem; color: #9f1239; margin: 0; }
    .reasons-list li { margin-bottom: 2px; }
    .drive-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(0, 0, 0, 0.06); }
    .applied-badge { padding: 6px 12px; font-size: 0.8125rem; }
  `]
})
export class StudentDrivesComponent implements OnInit {
  drives: JobDrive[] = [];
  loading = true;
  applyingId: string | null = null;

  constructor(
    private jobDriveService: JobDriveService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDrives();
  }

  loadDrives() {
    this.loading = true;
    this.jobDriveService.getJobDrives().subscribe({
      next: (res) => {
        this.drives = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  apply(drive: JobDrive) {
    this.applyingId = drive._id;
    this.applicationService.applyForDrive(drive._id).subscribe({
      next: () => {
        this.applyingId = null;
        this.notificationService.success(`Successfully applied to ${drive.title}!`);
        this.loadDrives();
      },
      error: () => {
        this.applyingId = null;
      }
    });
  }
}
