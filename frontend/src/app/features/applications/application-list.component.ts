import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { JobDriveService } from '../../core/services/job-drive.service';
import { DepartmentService } from '../../core/services/department.service';
import { NotificationService } from '../../core/services/notification.service';
import { Application, SelectionStage } from '../../core/models/application.model';
import { JobDrive } from '../../core/models/job-drive.model';
import { Department } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="applications-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Candidate Applications Pipeline</h1>
          <p class="page-subtitle">Track, shortlist, schedule, and advance candidate selection stages</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card filter-card">
        <div class="filter-grid">
          <input
            type="text"
            class="form-control"
            placeholder="Search student candidate or roll no..."
            [(ngModel)]="searchQuery"
            (input)="onFilterChange()"
          />
          <select class="form-control" [(ngModel)]="selectedDrive" (change)="onFilterChange()">
            <option value="">All Placement Drives</option>
            <option *ngFor="let drive of drives" [value]="drive._id">{{ drive.title }} ({{ drive.company?.name }})</option>
          </select>
          <select class="form-control" [(ngModel)]="selectedStage" (change)="onFilterChange()">
            <option value="">All Selection Stages</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Assessment">Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Offered">Offered</option>
            <option value="Joined">Joined</option>
          </select>
          <select class="form-control" [(ngModel)]="selectedDepartment" (change)="onFilterChange()">
            <option value="">All Departments</option>
            <option *ngFor="let dept of departments" [value]="dept._id">{{ dept.code }}</option>
          </select>
        </div>
      </div>

      <!-- Applications Table -->
      <div class="card table-card">
        <app-loading-spinner *ngIf="loading" message="Loading candidate applications..."></app-loading-spinner>

        <div *ngIf="!loading && applications.length > 0" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Placement Drive</th>
                <th>Academic Stats</th>
                <th>Current Stage</th>
                <th>Applied Date</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of applications">
                <td>
                  <strong>{{ app.student?.fullName }}</strong>
                  <div class="sub-text">{{ app.student?.rollNumber }} &bull; {{ app.student?.email }}</div>
                </td>
                <td>
                  <strong>{{ app.jobDrive?.title }}</strong>
                  <div class="sub-text">{{ app.jobDrive?.company?.name }} &bull; ₹ {{ app.jobDrive?.salaryPackage?.ctcLpa }} LPA</div>
                </td>
                <td>
                  <span class="badge badge-neutral">{{ app.student?.department?.code }}</span>
                  <div class="sub-text" style="margin-top: 4px;">
                    CGPA: <strong>{{ app.studentSnapshot?.cgpa || app.student?.cgpa }}</strong> &bull; Backlogs: {{ app.studentSnapshot?.activeBacklogs ?? app.student?.activeBacklogs }}
                  </div>
                </td>
                <td>
                  <span [class]="'badge badge-stage-' + app.currentStage.toLowerCase()">
                    {{ app.currentStage }}
                  </span>
                </td>
                <td>{{ app.createdAt | date: 'mediumDate' }}</td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" (click)="openStageModal(app)">
                    <i class="fa-solid fa-arrows-spin"></i> Update Stage
                  </button>
                  <button class="btn btn-outline btn-sm" (click)="openHistoryModal(app)" style="margin-left: 6px;">
                    <i class="fa-solid fa-timeline"></i> Timeline
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state
          *ngIf="!loading && applications.length === 0"
          icon="fa-solid fa-file-signature"
          title="No applications match filters"
          message="No student applications were found with the selected criteria."
        ></app-empty-state>
      </div>

      <!-- Stage Update Modal -->
      <div class="modal-backdrop" *ngIf="isStageModalOpen" (click)="isStageModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Advance Selection Stage</h3>
            <button class="btn-close" (click)="isStageModalOpen = false"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveStageUpdate()">
            <div class="modal-body">
              <div class="candidate-summary" *ngIf="selectedApp">
                <div>Candidate: <strong>{{ selectedApp.student?.fullName }}</strong> ({{ selectedApp.student?.rollNumber }})</div>
                <div>Job Role: <strong>{{ selectedApp.jobDrive?.title }}</strong></div>
              </div>

              <div class="form-group" style="margin-top: 16px;">
                <label class="form-label">New Selection Stage *</label>
                <select class="form-control" [(ngModel)]="newStage" name="stage" required>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offered">Offered</option>
                  <option value="Joined">Joined</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Officer Remarks / Comments</label>
                <textarea
                  class="form-control"
                  rows="3"
                  [(ngModel)]="stageRemarks"
                  name="remarks"
                  placeholder="e.g. Scored 88% in DSA assessment, recommended for technical interview round"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="isStageModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>Update Stage</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- History Timeline Modal -->
      <div class="modal-backdrop" *ngIf="isHistoryModalOpen" (click)="isHistoryModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Application Progression Timeline</h3>
            <button class="btn-close" (click)="isHistoryModalOpen = false"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body">
            <div class="timeline" *ngIf="selectedApp?.stageHistory">
              <div *ngFor="let item of selectedApp?.stageHistory" class="timeline-step">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="step-header">
                    <span [class]="'badge badge-stage-' + item.stage.toLowerCase()">{{ item.stage }}</span>
                    <span class="timeline-date">{{ item.updatedAt | date: 'medium' }}</span>
                  </div>
                  <p class="timeline-remarks">{{ item.remarks || 'Stage updated' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .applications-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .filter-grid { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1.2fr; gap: 14px; }
    .sub-text { font-size: 0.75rem; color: #64748b; }
    .candidate-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 12px; font-size: 0.875rem; color: #334155; }
    .timeline { display: flex; flex-direction: column; gap: 20px; padding-left: 12px; border-left: 2px solid #e2e8f0; margin: 10px 0; }
    .timeline-step { position: relative; padding-left: 18px; }
    .timeline-dot { position: absolute; left: -25px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #2563eb; border: 2px solid #ffffff; }
    .step-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .timeline-date { font-size: 0.75rem; color: #64748b; }
    .timeline-remarks { font-size: 0.8125rem; color: #475569; margin: 0; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
    @media (max-width: 900px) { .filter-grid { grid-template-columns: 1fr; } }
  `]
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  drives: JobDrive[] = [];
  departments: Department[] = [];
  loading = true;

  searchQuery = '';
  selectedDrive = '';
  selectedStage = '';
  selectedDepartment = '';

  isStageModalOpen = false;
  isHistoryModalOpen = false;
  modalSaving = false;
  selectedApp: Application | null = null;
  newStage: SelectionStage = 'Applied';
  stageRemarks = '';

  constructor(
    private applicationService: ApplicationService,
    private jobDriveService: JobDriveService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.jobDriveService.getJobDrives().subscribe({ next: (res) => (this.drives = res.data) });
    this.departmentService.getDepartments().subscribe({ next: (res) => (this.departments = res.data) });
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.applicationService
      .getApplications({
        search: this.searchQuery,
        jobDriveId: this.selectedDrive,
        stage: this.selectedStage,
        department: this.selectedDepartment
      })
      .subscribe({
        next: (res) => {
          this.applications = res.data;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  onFilterChange() {
    this.loadApplications();
  }

  openStageModal(app: Application) {
    this.selectedApp = app;
    this.newStage = app.currentStage;
    this.stageRemarks = '';
    this.isStageModalOpen = true;
  }

  openHistoryModal(app: Application) {
    this.selectedApp = app;
    this.isHistoryModalOpen = true;
  }

  saveStageUpdate() {
    if (!this.selectedApp) return;
    this.modalSaving = true;

    this.applicationService.updateStage(this.selectedApp._id, this.newStage, this.stageRemarks).subscribe({
      next: () => {
        this.notificationService.success(`Application advanced to ${this.newStage}`);
        this.modalSaving = false;
        this.isStageModalOpen = false;
        this.loadApplications();
      },
      error: () => (this.modalSaving = false)
    });
  }
}
