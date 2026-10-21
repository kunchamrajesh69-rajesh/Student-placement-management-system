import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student } from '../../core/models/student.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Candidate Profile & Academic Portfolio</h1>
          <p class="page-subtitle">Maintain your contact details, resume link, certifications, and technical skills</p>
        </div>
        <button class="btn btn-primary" (click)="saveProfile()" [disabled]="saving">
          <i class="fa-solid fa-spinner fa-spin" *ngIf="saving"></i>
          <i class="fa-solid fa-floppy-disk" *ngIf="!saving"></i>
          <span>Save Changes</span>
        </button>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your profile..."></app-loading-spinner>

      <div *ngIf="!loading && student" class="profile-content">
        <!-- Locked Academic Details Notice -->
        <div class="card locked-card">
          <div class="locked-header">
            <div class="locked-icon"><i class="fa-solid fa-lock"></i></div>
            <div>
              <h3 class="locked-title">Verified Academic Credentials</h3>
              <p class="locked-sub">Official records managed strictly by the College Administration & Placement Cell</p>
            </div>
          </div>
          <div class="grid-4 locked-fields">
            <div class="locked-field">
              <span class="field-label">Roll Number</span>
              <span class="field-val">{{ student.rollNumber }}</span>
            </div>
            <div class="locked-field">
              <span class="field-label">Department</span>
              <span class="field-val">{{ student.department.name }} ({{ student.department.code }})</span>
            </div>
            <div class="locked-field">
              <span class="field-label">Graduation Batch</span>
              <span class="field-val">Class of {{ student.batch }}</span>
            </div>
            <div class="locked-field">
              <span class="field-label">Cumulative CGPA</span>
              <span class="field-val text-emerald">{{ student.cgpa }} / 10.0</span>
            </div>
            <div class="locked-field">
              <span class="field-label">Active Backlogs</span>
              <span class="field-val" [class.text-rose]="student.activeBacklogs > 0">{{ student.activeBacklogs }}</span>
            </div>
            <div class="locked-field">
              <span class="field-label">Historical Backlogs</span>
              <span class="field-val">{{ student.historicalBacklogs }}</span>
            </div>
            <div class="locked-field">
              <span class="field-label">Placement Status</span>
              <span [class]="'badge badge-stage-' + student.placementStatus.toLowerCase()">{{ student.placementStatus }}</span>
            </div>
          </div>
        </div>

        <!-- Editable Portfolio Card -->
        <div class="card editable-card">
          <h3 class="card-title">Editable Contact & Portfolio Information</h3>

          <div class="grid-2" style="margin-top: 16px;">
            <div class="form-group">
              <label class="form-label">Full Name (Read-Only)</label>
              <input type="text" class="form-control" [value]="student.fullName" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Institutional Email (Read-Only)</label>
              <input type="email" class="form-control" [value]="student.email" disabled />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Contact Phone Number *</label>
              <input type="text" class="form-control" [(ngModel)]="student.phone" placeholder="+91 9876543210" />
            </div>
            <div class="form-group">
              <label class="form-label">Resume / CV Web Link (Google Drive / Cloud URL) *</label>
              <input type="url" class="form-control" [(ngModel)]="student.resumeUrl" placeholder="https://drive.google.com/file/d/..." />
            </div>
          </div>

          <!-- Skills Manager -->
          <div class="form-group" style="margin-top: 10px;">
            <label class="form-label">Technical Skills & Competencies</label>
            <div class="skills-input-row">
              <input
                type="text"
                class="form-control"
                placeholder="Type skill and press Enter (e.g. Angular, Node.js, Python)..."
                [(ngModel)]="newSkill"
                (keydown.enter)="addSkill($event)"
              />
              <button type="button" class="btn btn-secondary btn-sm" (click)="addSkill()">Add Skill</button>
            </div>
            <div class="skills-tags-container">
              <span *ngFor="let skill of student.skills; let i = index" class="skill-tag">
                {{ skill }}
                <i class="fa-solid fa-xmark remove-skill" (click)="removeSkill(i)"></i>
              </span>
              <span *ngIf="!student.skills || student.skills.length === 0" class="no-skills-text">
                No technical skills added yet. Add your core languages and frameworks above.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .locked-card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 22px; }
    .locked-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .locked-icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .locked-title { font-size: 1.125rem; color: #1e293b; }
    .locked-sub { font-size: 0.8125rem; color: #64748b; }
    .locked-fields { gap: 16px; }
    .locked-field { display: flex; flex-direction: column; background: #ffffff; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid #e2e8f0; }
    .field-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .field-val { font-size: 0.9375rem; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .editable-card { padding: 24px; }
    .skills-input-row { display: flex; gap: 10px; margin-bottom: 12px; }
    .skills-tags-container { display: flex; flex-wrap: wrap; gap: 8px; min-height: 40px; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-md); }
    .skill-tag { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 600; }
    .remove-skill { cursor: pointer; color: #60a5fa; font-size: 0.875rem; }
    .remove-skill:hover { color: #ef4444; }
    .no-skills-text { font-size: 0.8125rem; color: #94a3b8; padding: 4px; }
    .text-emerald { color: #059669; }
    .text-rose { color: #e11d48; }
  `]
})
export class StudentProfileComponent implements OnInit {
  student: Student | null = null;
  loading = true;
  saving = false;
  newSkill = '';

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    const profileId = user?.studentProfile?._id || user?.studentProfile;
    if (profileId) {
      this.studentService.getStudentById(profileId as string).subscribe({
        next: (res) => {
          this.student = res.data;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }

  addSkill(event?: Event) {
    if (event) event.preventDefault();
    if (!this.newSkill.trim() || !this.student) return;
    if (!this.student.skills) this.student.skills = [];
    if (!this.student.skills.includes(this.newSkill.trim())) {
      this.student.skills.push(this.newSkill.trim());
    }
    this.newSkill = '';
  }

  removeSkill(index: number) {
    if (this.student?.skills) {
      this.student.skills.splice(index, 1);
    }
  }

  saveProfile() {
    if (!this.student) return;
    this.saving = true;

    const payload = {
      phone: this.student.phone,
      resumeUrl: this.student.resumeUrl,
      skills: this.student.skills
    };

    this.studentService.updateStudent(this.student._id, payload as any).subscribe({
      next: (res) => {
        this.student = res.data;
        this.authService.updateCurrentUserProfile(res.data);
        this.saving = false;
        this.notificationService.success('Candidate profile updated successfully');
      },
      error: () => (this.saving = false)
    });
  }
}
