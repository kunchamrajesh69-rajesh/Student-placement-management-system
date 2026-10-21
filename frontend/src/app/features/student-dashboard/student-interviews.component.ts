import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService } from '../../core/services/interview.service';
import { Interview } from '../../core/models/interview.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-student-interviews',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="interviews-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Scheduled Interviews</h1>
          <p class="page-subtitle">View meeting links, instructions, and dates for upcoming evaluation rounds</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your interview schedule..."></app-loading-spinner>

      <div *ngIf="!loading && interviews.length > 0" class="grid-2 iv-grid">
        <div *ngFor="let iv of interviews" class="card interview-card">
          <div class="card-top">
            <div>
              <span class="company-tag">{{ iv.jobDrive.company.name }}</span>
              <h3 class="round-title">{{ iv.roundName }}</h3>
              <span class="role-title">{{ iv.jobDrive.title }}</span>
            </div>
            <span class="badge" [ngClass]="iv.status === 'Scheduled' ? 'badge-primary' : 'badge-success'">
              {{ iv.status }}
            </span>
          </div>

          <div class="schedule-box">
            <div class="sched-item">
              <i class="fa-regular fa-calendar"></i>
              <span><strong>{{ iv.interviewDate | date: 'fullDate' }}</strong></span>
            </div>
            <div class="sched-item">
              <i class="fa-regular fa-clock"></i>
              <span>{{ iv.interviewTime }}</span>
            </div>
            <div class="sched-item">
              <i class="fa-solid fa-laptop"></i>
              <span>Mode: <strong>{{ iv.mode }}</strong></span>
            </div>
          </div>

          <div class="instructions-box" *ngIf="iv.instructions">
            <strong>Candidate Instructions:</strong>
            <p>{{ iv.instructions }}</p>
          </div>

          <div class="card-bottom">
            <a
              *ngIf="iv.locationOrLink && iv.mode === 'Online'"
              [href]="iv.locationOrLink"
              target="_blank"
              rel="noopener"
              class="btn btn-primary btn-sm btn-block"
            >
              <i class="fa-solid fa-video"></i>
              Join Interview Meeting
            </a>
            <div *ngIf="iv.mode === 'Offline'" class="offline-venue">
              <i class="fa-solid fa-location-dot"></i> Venue: <strong>{{ iv.locationOrLink }}</strong>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && interviews.length === 0"
        icon="fa-solid fa-calendar-xmark"
        title="No interviews scheduled yet"
        message="When a recruiting company shortlists your application, scheduled rounds will appear here."
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .interviews-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .interview-card { display: flex; flex-direction: column; justify-content: space-between; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .company-tag { font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .round-title { font-size: 1.125rem; color: #0f172a; margin-top: 2px; }
    .role-title { font-size: 0.8125rem; color: #64748b; }
    .schedule-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 0.875rem; color: #334155; }
    .sched-item { display: flex; align-items: center; gap: 10px; }
    .sched-item i { color: #64748b; width: 16px; text-align: center; }
    .instructions-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; font-size: 0.8125rem; color: #92400e; }
    .instructions-box p { margin: 4px 0 0; }
    .btn-block { width: 100%; }
    .offline-venue { font-size: 0.875rem; color: #475569; padding: 6px 0; }
  `]
})
export class StudentInterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  loading = true;

  constructor(private interviewService: InterviewService) {}

  ngOnInit() {
    this.interviewService.getInterviews().subscribe({
      next: (res) => {
        this.interviews = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
