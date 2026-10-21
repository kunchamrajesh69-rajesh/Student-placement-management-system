import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JobDriveService } from '../../core/services/job-drive.service';
import { CompanyService } from '../../core/services/company.service';
import { DepartmentService } from '../../core/services/department.service';
import { NotificationService } from '../../core/services/notification.service';
import { JobDrive } from '../../core/models/job-drive.model';
import { Company } from '../../core/models/company.model';
import { Department } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-job-drive-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="drives-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Campus Placement Drives</h1>
          <p class="page-subtitle">Publish recruitment opportunities, configure eligibility cutoffs, and track applicants</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="fa-solid fa-bullhorn"></i>
          Publish New Drive
        </button>
      </div>

      <!-- Drives Grid -->
      <app-loading-spinner *ngIf="loading" message="Loading placement drives..."></app-loading-spinner>

      <div *ngIf="!loading && drives.length > 0" class="grid-2">
        <div *ngFor="let drive of drives" class="card drive-card">
          <div class="drive-card-header">
            <div>
              <span class="company-badge">{{ drive.company?.name }}</span>
              <h3 class="drive-title">{{ drive.title }}</h3>
            </div>
            <span class="badge" [ngClass]="drive.status === 'Active' ? 'badge-success' : 'badge-neutral'">
              {{ drive.status }}
            </span>
          </div>

          <p class="drive-desc">{{ drive.description }}</p>

          <div class="drive-metrics-grid">
            <div class="metric-box">
              <span class="box-label">CTC Package</span>
              <div class="box-val text-emerald">₹ {{ drive.salaryPackage?.ctcLpa }} LPA</div>
            </div>
            <div class="metric-box">
              <span class="box-label">Min CGPA</span>
              <div class="box-val">{{ drive.eligibilityCriteria?.minCgpa }}</div>
            </div>
            <div class="metric-box">
              <span class="box-label">Max Backlogs</span>
              <div class="box-val">{{ drive.eligibilityCriteria.maxBacklogs }}</div>
            </div>
            <div class="metric-box">
              <span class="box-label">Deadline</span>
              <div class="box-val deadline-val">{{ drive.applicationDeadline | date: 'mediumDate' }}</div>
            </div>
          </div>

          <div class="criteria-pills">
            <span class="criteria-label">Eligible Streams:</span>
            <span *ngFor="let dept of drive.eligibilityCriteria?.eligibleDepartments" class="badge badge-neutral">
              {{ dept.code }}
            </span>
          </div>

          <div class="drive-footer">
            <a [routerLink]="['/admin/placement-drives', drive._id]" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-users-viewfinder"></i>
              View Applicants & Eligibility
            </a>
            <div class="footer-actions">
              <button class="btn btn-secondary btn-sm" (click)="openEditModal(drive)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger btn-sm" (click)="deleteDrive(drive)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && drives.length === 0"
        icon="fa-solid fa-bullhorn"
        title="No placement drives found"
        message="Create your first placement drive with custom eligibility rules to notify students."
      ></app-empty-state>

      <!-- Publish Drive Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">{{ isEditMode ? 'Update Placement Drive' : 'Publish Campus Placement Drive' }}</h3>
            <button class="btn-close" (click)="closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveDrive()">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Job Role Title *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentDrive.title" name="title" required placeholder="e.g. Software Engineer" />
                </div>
                <div class="form-group">
                  <label class="form-label">Recruiting Company *</label>
                  <select class="form-control" [(ngModel)]="currentDrive.company" name="company" required>
                    <option value="" disabled>Select Company</option>
                    <option *ngFor="let c of companies" [value]="c._id">{{ c.name }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Job Description *</label>
                <textarea class="form-control" rows="3" [(ngModel)]="currentDrive.description" name="description" required placeholder="Role details, responsibilities..."></textarea>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Job Type</label>
                  <select class="form-control" [(ngModel)]="currentDrive.jobType" name="jobType">
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Internship+FTE">Internship+FTE</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Location *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentDrive.location" name="location" required placeholder="e.g. Bengaluru / Hybrid" />
                </div>
                <div class="form-group">
                  <label class="form-label">CTC Package (LPA) *</label>
                  <input type="number" step="0.1" class="form-control" [(ngModel)]="currentDrive.ctcLpa" name="ctcLpa" required placeholder="12.5" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Application Deadline *</label>
                  <input type="date" class="form-control" [(ngModel)]="deadlineDateStr" name="deadline" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Drive Status</label>
                  <select class="form-control" [(ngModel)]="currentDrive.status" name="status">
                    <option value="Active">Active (Accepting Applications)</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <!-- Eligibility Rules Builder -->
              <div class="eligibility-builder-card">
                <h4 class="builder-heading"><i class="fa-solid fa-sliders"></i> Eligibility Engine Criteria</h4>
                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label">Minimum CGPA Threshold *</label>
                    <input type="number" step="0.1" min="0" max="10" class="form-control" [(ngModel)]="currentDrive.minCgpa" name="minCgpa" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Maximum Allowed Backlogs *</label>
                    <input type="number" min="0" class="form-control" [(ngModel)]="currentDrive.maxBacklogs" name="maxBacklogs" required />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Eligible Departments (Check all that apply)</label>
                  <div class="dept-checkboxes">
                    <label *ngFor="let dept of departments" class="checkbox-pill">
                      <input type="checkbox" [checked]="isDeptSelected(dept._id)" (change)="toggleDept(dept._id)" />
                      <span>{{ dept.code }} ({{ dept.name }})</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>{{ isEditMode ? 'Update Drive' : 'Publish Drive' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drives-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .drive-card { display: flex; flex-direction: column; justify-content: space-between; }
    .drive-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .company-badge { font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px; }
    .drive-title { font-size: 1.125rem; color: #0f172a; }
    .drive-desc { font-size: 0.8125rem; color: #64748b; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .drive-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .metric-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 8px 10px; text-align: center; }
    .box-label { font-size: 0.6875rem; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; }
    .box-val { font-size: 1rem; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .deadline-val { font-size: 0.8125rem; }
    .criteria-pills { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 18px; }
    .criteria-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
    .drive-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .footer-actions { display: flex; gap: 6px; }
    .eligibility-builder-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 16px; margin-top: 10px; }
    .builder-heading { font-size: 0.875rem; font-weight: 700; color: #1e293b; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .dept-checkboxes { display: flex; flex-wrap: wrap; gap: 8px; }
    .checkbox-pill { display: flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: var(--radius-full); font-size: 0.8125rem; cursor: pointer; }
    .text-emerald { color: #059669; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
  `]
})
export class JobDriveListComponent implements OnInit {
  drives: JobDrive[] = [];
  companies: Company[] = [];
  departments: Department[] = [];
  loading = true;

  isModalOpen = false;
  isEditMode = false;
  modalSaving = false;
  currentDrive: any = {};
  selectedDeptIds: string[] = [];
  deadlineDateStr = '';

  constructor(
    private jobDriveService: JobDriveService,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDrives();
    this.companyService.getCompanies().subscribe({ next: (res) => (this.companies = res.data) });
    this.departmentService.getDepartments().subscribe({ next: (res) => (this.departments = res.data) });
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

  openAddModal() {
    this.isEditMode = false;
    this.currentDrive = {
      jobType: 'Full-Time',
      status: 'Active',
      minCgpa: 6.5,
      maxBacklogs: 0,
      ctcLpa: 8.0
    };
    this.selectedDeptIds = this.departments.map((d) => d._id);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    this.deadlineDateStr = futureDate.toISOString().split('T')[0];
    this.isModalOpen = true;
  }

  openEditModal(drive: JobDrive) {
    this.isEditMode = true;
    this.currentDrive = {
      _id: drive._id,
      title: drive.title,
      company: drive.company?._id || drive.company,
      description: drive.description,
      jobType: drive.jobType,
      location: drive.location,
      status: drive.status,
      ctcLpa: drive.salaryPackage?.ctcLpa,
      minCgpa: drive.eligibilityCriteria?.minCgpa,
      maxBacklogs: drive.eligibilityCriteria?.maxBacklogs
    };
    this.selectedDeptIds = (drive.eligibilityCriteria?.eligibleDepartments || []).map((d: any) => d._id || d);
    if (drive.applicationDeadline) {
      this.deadlineDateStr = new Date(drive.applicationDeadline).toISOString().split('T')[0];
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  isDeptSelected(id: string): boolean {
    return this.selectedDeptIds.includes(id);
  }

  toggleDept(id: string) {
    if (this.isDeptSelected(id)) {
      this.selectedDeptIds = this.selectedDeptIds.filter((d) => d !== id);
    } else {
      this.selectedDeptIds.push(id);
    }
  }

  saveDrive() {
    this.modalSaving = true;
    const payload = {
      title: this.currentDrive.title,
      company: this.currentDrive.company,
      description: this.currentDrive.description,
      jobType: this.currentDrive.jobType,
      location: this.currentDrive.location,
      status: this.currentDrive.status,
      salaryPackage: {
        ctcLpa: Number(this.currentDrive.ctcLpa)
      },
      applicationDeadline: new Date(this.deadlineDateStr),
      eligibilityCriteria: {
        minCgpa: Number(this.currentDrive.minCgpa),
        maxBacklogs: Number(this.currentDrive.maxBacklogs),
        eligibleDepartments: this.selectedDeptIds,
        eligibleBatches: [2025]
      }
    };

    if (this.isEditMode) {
      this.jobDriveService.updateJobDrive(this.currentDrive._id, payload as any).subscribe({
        next: () => {
          this.notificationService.success('Drive updated successfully');
          this.modalSaving = false;
          this.closeModal();
          this.loadDrives();
        },
        error: () => (this.modalSaving = false)
      });
    } else {
      this.jobDriveService.createJobDrive(payload as any).subscribe({
        next: () => {
          this.notificationService.success('Placement drive published');
          this.modalSaving = false;
          this.closeModal();
          this.loadDrives();
        },
        error: () => (this.modalSaving = false)
      });
    }
  }

  deleteDrive(drive: JobDrive) {
    if (confirm(`Are you sure you want to remove drive "${drive.title}"?`)) {
      this.jobDriveService.deleteJobDrive(drive._id).subscribe({
        next: () => {
          this.notificationService.success('Placement drive deleted');
          this.loadDrives();
        }
      });
    }
  }
}
