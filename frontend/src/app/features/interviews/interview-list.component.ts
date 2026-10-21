import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../core/services/interview.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { Interview } from '../../core/models/interview.model';
import { Application } from '../../core/models/application.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="interviews-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Interview Schedules & Rounds</h1>
          <p class="page-subtitle">Coordinate technical assessments, interviews, and evaluation feedback</p>
        </div>
        <button class="btn btn-primary" (click)="openScheduleModal()">
          <i class="fa-solid fa-calendar-plus"></i>
          Schedule Interview
        </button>
      </div>

      <div class="card table-card">
        <app-loading-spinner *ngIf="loading" message="Loading interview calendar..."></app-loading-spinner>

        <div *ngIf="!loading && interviews.length > 0" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Placement Drive</th>
                <th>Round Name</th>
                <th>Schedule</th>
                <th>Mode & Meeting Link</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let iv of interviews">
                <td>
                  <strong>{{ iv.student?.fullName }}</strong>
                  <div class="sub-cell">{{ iv.student?.rollNumber }} &bull; {{ iv.student?.email }}</div>
                </td>
                <td>
                  <strong>{{ iv.jobDrive?.title }}</strong>
                  <div class="sub-cell">{{ iv.jobDrive?.company?.name }}</div>
                </td>
                <td>
                  <span class="badge badge-purple">{{ iv.roundName }}</span>
                </td>
                <td>
                  <strong>{{ iv.interviewDate | date: 'mediumDate' }}</strong>
                  <div class="sub-cell">{{ iv.interviewTime }}</div>
                </td>
                <td>
                  <span class="badge badge-neutral">{{ iv.mode }}</span>
                  <div class="link-cell" *ngIf="iv.locationOrLink">
                    <a [href]="iv.locationOrLink" target="_blank" rel="noopener">
                      <i class="fa-solid fa-link"></i> Join Link
                    </a>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="iv.status === 'Scheduled' ? 'badge-primary' : (iv.status === 'Completed' ? 'badge-success' : 'badge-danger')">
                    {{ iv.status }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" (click)="openStatusModal(iv)">
                    Status & Feedback
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state
          *ngIf="!loading && interviews.length === 0"
          icon="fa-solid fa-calendar-check"
          title="No scheduled interviews"
          message="No candidate interviews scheduled yet. Select an application to set up a round."
        ></app-empty-state>
      </div>

      <!-- Schedule Modal -->
      <div class="modal-backdrop" *ngIf="isScheduleModalOpen" (click)="isScheduleModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Schedule Interview Round</h3>
            <button class="btn-close" (click)="isScheduleModalOpen = false"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveInterview()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Candidate Application *</label>
                <select class="form-control" [(ngModel)]="newInterview.applicationId" name="appId" required>
                  <option value="" disabled>Select Shortlisted Candidate</option>
                  <option *ngFor="let app of eligibleApps" [value]="app._id">
                    {{ app.student?.fullName }} ({{ app.student?.rollNumber }}) &mdash; {{ app.jobDrive?.title }}
                  </option>
                </select>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Round Title *</label>
                  <input type="text" class="form-control" [(ngModel)]="newInterview.roundName" name="round" required placeholder="e.g. Technical Round 1: DSA" />
                </div>
                <div class="form-group">
                  <label class="form-label">Mode</label>
                  <select class="form-control" [(ngModel)]="newInterview.mode" name="mode">
                    <option value="Online">Online (Virtual Meeting)</option>
                    <option value="Offline">Offline (Campus Placement Cell)</option>
                  </select>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Interview Date *</label>
                  <input type="date" class="form-control" [(ngModel)]="newInterview.interviewDate" name="date" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Interview Time *</label>
                  <input type="text" class="form-control" [(ngModel)]="newInterview.interviewTime" name="time" required placeholder="10:30 AM IST" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Location or Meeting Link *</label>
                <input type="text" class="form-control" [(ngModel)]="newInterview.locationOrLink" name="link" required placeholder="https://meet.google.com/xyz or Room 402" />
              </div>

              <div class="form-group">
                <label class="form-label">Candidate Instructions</label>
                <textarea class="form-control" rows="2" [(ngModel)]="newInterview.instructions" name="instructions" placeholder="Please bring college ID, resume copy, and maintain good network."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="isScheduleModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>Schedule Round</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Status Modal -->
      <div class="modal-backdrop" *ngIf="isStatusModalOpen" (click)="isStatusModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Update Interview Status & Rating</h3>
            <button class="btn-close" (click)="isStatusModalOpen = false"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveStatusUpdate()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Round Status</label>
                <select class="form-control" [(ngModel)]="statusUpdate.status" name="status">
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Interviewer Rating (1 - 5 Stars)</label>
                <input type="number" min="1" max="5" class="form-control" [(ngModel)]="statusUpdate.rating" name="rating" placeholder="5" />
              </div>
              <div class="form-group">
                <label class="form-label">Feedback Notes</label>
                <textarea class="form-control" rows="3" [(ngModel)]="statusUpdate.comments" name="comments" placeholder="Detailed interviewer feedback"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="isStatusModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">Save Feedback</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interviews-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .sub-cell { font-size: 0.75rem; color: #64748b; }
    .link-cell { font-size: 0.75rem; margin-top: 4px; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
  `]
})
export class InterviewListComponent implements OnInit {
  interviews: Interview[] = [];
  eligibleApps: Application[] = [];
  loading = true;

  isScheduleModalOpen = false;
  isStatusModalOpen = false;
  modalSaving = false;

  newInterview: any = {};
  selectedInterview: Interview | null = null;
  statusUpdate: any = {};

  constructor(
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadInterviews();
    this.applicationService.getApplications().subscribe({
      next: (res) => (this.eligibleApps = res.data)
    });
  }

  loadInterviews() {
    this.loading = true;
    this.interviewService.getInterviews().subscribe({
      next: (res) => {
        this.interviews = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openScheduleModal() {
    this.newInterview = {
      applicationId: '',
      roundName: 'Round 1: Technical Interview',
      mode: 'Online',
      interviewDate: new Date().toISOString().split('T')[0],
      interviewTime: '10:00 AM IST'
    };
    this.isScheduleModalOpen = true;
  }

  saveInterview() {
    this.modalSaving = true;
    this.interviewService.scheduleInterview(this.newInterview).subscribe({
      next: () => {
        this.notificationService.success('Interview round scheduled');
        this.modalSaving = false;
        this.isScheduleModalOpen = false;
        this.loadInterviews();
      },
      error: () => (this.modalSaving = false)
    });
  }

  openStatusModal(iv: Interview) {
    this.selectedInterview = iv;
    this.statusUpdate = {
      status: iv.status,
      rating: iv.feedback?.rating || 4,
      comments: iv.feedback?.comments || ''
    };
    this.isStatusModalOpen = true;
  }

  saveStatusUpdate() {
    if (!this.selectedInterview) return;
    this.modalSaving = true;
    const payload = {
      status: this.statusUpdate.status,
      feedback: {
        rating: Number(this.statusUpdate.rating),
        comments: this.statusUpdate.comments
      }
    };

    this.interviewService.updateInterview(this.selectedInterview._id, payload as any).subscribe({
      next: () => {
        this.notificationService.success('Interview status and feedback updated');
        this.modalSaving = false;
        this.isStatusModalOpen = false;
        this.loadInterviews();
      },
      error: () => (this.modalSaving = false)
    });
  }
}
