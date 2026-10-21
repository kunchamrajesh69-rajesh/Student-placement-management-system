import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../core/services/application.service';
import { Application } from '../../core/models/application.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="applications-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Application Progressions</h1>
          <p class="page-subtitle">Track stage updates, evaluation milestones, and recruitment decisions</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your recruitment submissions..."></app-loading-spinner>

      <div *ngIf="!loading && applications.length > 0" class="apps-list">
        <div *ngFor="let app of applications" class="card app-card">
          <div class="app-card-header">
            <div>
              <span class="company-name">{{ app.jobDrive.company.name }}</span>
              <h3 class="role-name">{{ app.jobDrive.title }}</h3>
            </div>
            <span [class]="'badge badge-stage-' + app.currentStage.toLowerCase()" style="font-size: 0.8125rem; padding: 6px 14px;">
              {{ app.currentStage }}
            </span>
          </div>

          <!-- Stage Progression Stepper Bar -->
          <div class="stage-stepper">
            <div
              *ngFor="let step of allStages; let i = index"
              class="stepper-node"
              [class.completed]="isStageCompleted(app.currentStage, step)"
              [class.active]="app.currentStage === step"
            >
              <div class="node-circle">
                <i class="fa-solid fa-check" *ngIf="isStageCompleted(app.currentStage, step) && app.currentStage !== step"></i>
                <span *ngIf="!isStageCompleted(app.currentStage, step) || app.currentStage === step">{{ i + 1 }}</span>
              </div>
              <span class="node-label">{{ step }}</span>
            </div>
          </div>

          <!-- History Timeline Drawer -->
          <div class="timeline-container">
            <span class="history-title"><i class="fa-solid fa-clock-rotate-left"></i> Stage History</span>
            <div class="timeline-items">
              <div *ngFor="let h of app.stageHistory" class="timeline-entry">
                <div class="dot"></div>
                <div class="entry-content">
                  <div class="entry-top">
                    <strong>{{ h.stage }}</strong>
                    <span class="entry-time">{{ h.updatedAt | date: 'medium' }}</span>
                  </div>
                  <p class="entry-remarks">{{ h.remarks || 'Status advanced' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && applications.length === 0"
        icon="fa-solid fa-paper-plane"
        title="No applications submitted"
        message="You have not submitted applications to any placement drives yet. Head to Placement Drives to apply!"
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .applications-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .apps-list { display: flex; flex-direction: column; gap: 20px; }
    .app-card { padding: 24px; }
    .app-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .company-name { font-size: 0.8125rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .role-name { font-size: 1.25rem; color: #0f172a; margin-top: 2px; }

    /* Stepper */
    .stage-stepper { display: flex; align-items: center; justify-content: space-between; position: relative; margin: 24px 0 32px; }
    .stage-stepper::before { content: ''; position: absolute; top: 16px; left: 24px; right: 24px; height: 3px; background: #e2e8f0; z-index: 1; }
    .stepper-node { display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2; position: relative; }
    .node-circle { width: 34px; height: 34px; border-radius: 50%; background: #ffffff; border: 2px solid #cbd5e1; color: #64748b; font-weight: 700; font-size: 0.8125rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .node-label { font-size: 0.6875rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .stepper-node.completed .node-circle { background: #10b981; border-color: #10b981; color: #ffffff; }
    .stepper-node.completed .node-label { color: #059669; }
    .stepper-node.active .node-circle { background: #2563eb; border-color: #2563eb; color: #ffffff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2); }
    .stepper-node.active .node-label { color: #1e40af; font-weight: 700; }

    .timeline-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 16px 20px; }
    .history-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .timeline-items { display: flex; flex-direction: column; gap: 14px; padding-left: 10px; border-left: 2px solid #cbd5e1; }
    .timeline-entry { position: relative; padding-left: 16px; }
    .dot { position: absolute; left: -21px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; border: 2px solid #ffffff; }
    .entry-top { display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem; }
    .entry-time { font-size: 0.75rem; color: #64748b; }
    .entry-remarks { font-size: 0.8125rem; color: #475569; margin-top: 2px; }

    @media (max-width: 800px) {
      .stage-stepper { display: none; }
    }
  `]
})
export class StudentApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading = true;

  allStages = [
    'Applied',
    'Shortlisted',
    'Assessment',
    'Interview',
    'Selected',
    'Offered',
    'Joined'
  ];

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.applicationService.getMyApplications().subscribe({
      next: (res) => {
        this.applications = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  isStageCompleted(currentStage: string, checkStage: string): boolean {
    const currentIndex = this.allStages.indexOf(currentStage);
    const checkIndex = this.allStages.indexOf(checkStage);
    return currentIndex >= checkIndex;
  }
}
