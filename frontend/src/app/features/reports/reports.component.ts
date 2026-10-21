import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminDashboardData } from '../../core/models/dashboard.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Placement Reports & Formal Exports</h1>
          <p class="page-subtitle">Accreditation-ready placement analytics, denominator-verified percentages & CSV downloads</p>
        </div>
        <button class="btn btn-primary" (click)="downloadCSV()" [disabled]="downloading">
          <i class="fa-solid fa-spinner fa-spin" *ngIf="downloading"></i>
          <i class="fa-solid fa-file-csv" *ngIf="!downloading"></i>
          <span>Download Placement CSV</span>
        </button>
      </div>

      <app-loading-spinner *ngIf="loading" message="Compiling placement report metrics..."></app-loading-spinner>

      <div *ngIf="!loading && data" class="reports-content">
        <!-- Summary Cards -->
        <div class="grid-4">
          <div class="card stat-block">
            <span class="block-label">Total Registered</span>
            <div class="block-number">{{ data.summary.totalStudents }}</div>
            <span class="block-sub">Total enrolled students in batch</span>
          </div>

          <div class="card stat-block border-emerald">
            <span class="block-label">Placed Students</span>
            <div class="block-number text-emerald">{{ data.summary.placedStudents }}</div>
            <span class="block-sub">{{ data.summary.placementPercentage }}% verified placement</span>
          </div>

          <div class="card stat-block border-blue">
            <span class="block-label">Average CTC</span>
            <div class="block-number text-blue">₹ {{ data.packageStats.averageLPA }} <span style="font-size: 1rem;">LPA</span></div>
            <span class="block-sub">Computed across verified offers</span>
          </div>

          <div class="card stat-block border-amber">
            <span class="block-label">Highest Package</span>
            <div class="block-number text-amber">₹ {{ data.packageStats.highestLPA }} <span style="font-size: 1rem;">LPA</span></div>
            <span class="block-sub">Top campus tier offer</span>
          </div>
        </div>

        <!-- Department Table -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3 class="card-title">Department-Wise Placement Summary</h3>
            <span class="badge badge-primary">Audited Statistics</span>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Registered Students</th>
                  <th>Placed Students</th>
                  <th>Unplaced</th>
                  <th>Average CGPA</th>
                  <th>Placement Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let dept of data.departmentStats">
                  <td>
                    <strong>{{ dept.departmentCode }}</strong> &mdash; {{ dept.departmentName }}
                  </td>
                  <td><strong>{{ dept.totalStudents }}</strong></td>
                  <td><span class="badge badge-success">{{ dept.placedStudents }}</span></td>
                  <td>{{ dept.totalStudents - dept.placedStudents }}</td>
                  <td>{{ dept.avgCgpa }}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div class="progress-bar-container" style="width: 100px;">
                        <div class="progress-bar-fill" [style.width.%]="dept.placementPercentage"></div>
                      </div>
                      <strong>{{ dept.placementPercentage }}%</strong>
                    </div>
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
    .reports-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .stat-block { padding: 22px; }
    .block-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .block-number { font-size: 2rem; font-weight: 800; font-family: var(--font-display); color: #0f172a; margin-top: 4px; }
    .block-sub { font-size: 0.8125rem; color: #64748b; margin-top: 4px; display: block; }
    .border-emerald { border-left: 4px solid #10b981; }
    .border-blue { border-left: 4px solid #2563eb; }
    .border-amber { border-left: 4px solid #f59e0b; }
    .text-emerald { color: #059669; }
    .text-blue { color: #2563eb; }
    .text-amber { color: #d97706; }
  `]
})
export class ReportsComponent implements OnInit {
  data: AdminDashboardData | null = null;
  loading = true;
  downloading = false;

  constructor(
    private reportService: ReportService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.reportService.getPlacementReport().subscribe({
      next: (res) => {
        this.data = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  downloadCSV() {
    this.downloading = true;
    this.reportService.downloadPlacementCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `placement-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading = false;
        this.notificationService.success('Placement CSV downloaded successfully');
      },
      error: () => {
        this.downloading = false;
        this.notificationService.error('Failed to download placement CSV');
      }
    });
  }
}
