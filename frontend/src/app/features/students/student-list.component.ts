import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { DepartmentService } from '../../core/services/department.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student } from '../../core/models/student.model';
import { Department } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ConfirmModalComponent],
  template: `
    <div class="students-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Student Directory & Academic Records</h1>
          <p class="page-subtitle">Manage campus candidates, academic thresholds, and placement readiness</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="fa-solid fa-user-plus"></i>
          Register Student
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card filter-card">
        <div class="filter-grid">
          <div class="search-input-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              class="form-control"
              placeholder="Search by name, roll number, or email..."
              [(ngModel)]="searchQuery"
              (input)="onFilterChange()"
            />
          </div>

          <select class="form-control" [(ngModel)]="selectedDepartment" (change)="onFilterChange()">
            <option value="">All Departments</option>
            <option *ngFor="let dept of departments" [value]="dept._id">
              {{ dept.code }} - {{ dept.name }}
            </option>
          </select>

          <select class="form-control" [(ngModel)]="selectedBatch" (change)="onFilterChange()">
            <option value="">All Batches</option>
            <option value="2024">Class of 2024</option>
            <option value="2025">Class of 2025</option>
            <option value="2026">Class of 2026</option>
          </select>

          <select class="form-control" [(ngModel)]="selectedStatus" (change)="onFilterChange()">
            <option value="">All Placement Statuses</option>
            <option value="Unplaced">Unplaced</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Placed">Placed</option>
          </select>
        </div>
      </div>

      <!-- Students Table -->
      <div class="card table-card">
        <app-loading-spinner *ngIf="loading" message="Loading student records..."></app-loading-spinner>

        <div *ngIf="!loading && students.length > 0" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Batch</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students">
                <td>
                  <strong>{{ s.rollNumber }}</strong>
                </td>
                <td>
                  <div class="name-cell">
                    <strong>{{ s.fullName }}</strong>
                    <span class="sub-cell">{{ s.email }} &bull; {{ s.phone }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-neutral">{{ s.department.code || 'N/A' }}</span>
                </td>
                <td>{{ s.batch }}</td>
                <td>
                  <strong [class.text-emerald]="s.cgpa >= 8.0">{{ s.cgpa }}</strong>
                </td>
                <td>
                  <span [class.badge-danger]="s.activeBacklogs > 0" [class.badge-neutral]="s.activeBacklogs === 0" class="badge">
                    {{ s.activeBacklogs }} Active
                  </span>
                </td>
                <td>
                  <span [class]="'badge badge-stage-' + s.placementStatus.toLowerCase()">
                    {{ s.placementStatus }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" (click)="openEditModal(s)" title="Edit Student">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(s)" title="Delete Student" style="margin-left: 6px;">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state
          *ngIf="!loading && students.length === 0"
          icon="fa-solid fa-user-graduate"
          title="No students found"
          message="No student profiles match your search criteria. Register students or adjust filters."
        ></app-empty-state>
      </div>

      <!-- Create / Edit Student Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">{{ isEditMode ? 'Update Student Record' : 'Register New Student' }}</h3>
            <button class="btn-close" (click)="closeModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form (ngSubmit)="saveStudent()">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Roll Number *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="currentStudent.rollNumber"
                    name="rollNumber"
                    required
                    [disabled]="isEditMode"
                    placeholder="e.g. 21CS105"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="currentStudent.fullName"
                    name="fullName"
                    required
                    placeholder="Student's official name"
                  />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Institutional Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="currentStudent.email"
                    name="email"
                    required
                    [disabled]="isEditMode"
                    placeholder="student@college.edu"
                  />
                </div>
                <div class="form-group" *ngIf="!isEditMode">
                  <label class="form-label">Initial Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="currentStudent.password"
                    name="password"
                    required
                    placeholder="At least 6 characters"
                  />
                </div>
                <div class="form-group" *ngIf="isEditMode">
                  <label class="form-label">Phone Number *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="currentStudent.phone"
                    name="phone"
                    required
                  />
                </div>
              </div>

              <div class="grid-2" *ngIf="!isEditMode">
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="currentStudent.phone"
                    name="phone"
                    required
                    placeholder="+91 9876543210"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Department *</label>
                  <select
                    class="form-control"
                    [(ngModel)]="currentStudent.department"
                    name="department"
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    <option *ngFor="let d of departments" [value]="d._id">
                      {{ d.code }} - {{ d.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Batch (Year) *</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="currentStudent.batch"
                    name="batch"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">CGPA (0 - 10) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    class="form-control"
                    [(ngModel)]="currentStudent.cgpa"
                    name="cgpa"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Active Backlogs *</label>
                  <input
                    type="number"
                    min="0"
                    class="form-control"
                    [(ngModel)]="currentStudent.activeBacklogs"
                    name="activeBacklogs"
                    required
                  />
                </div>
              </div>

              <div class="form-group" *ngIf="isEditMode">
                <label class="form-label">Placement Status</label>
                <select class="form-control" [(ngModel)]="currentStudent.placementStatus" name="placementStatus">
                  <option value="Unplaced">Unplaced</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>{{ isEditMode ? 'Save Changes' : 'Register Student' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Student Profile"
        [message]="'Are you sure you want to delete ' + studentToDelete?.fullName + ' (' + studentToDelete?.rollNumber + ')? This will also revoke their login credentials.'"
        confirmText="Delete Student"
        (confirm)="handleDelete()"
        (cancel)="isDeleteModalOpen = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .students-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .filter-card {
      padding: 16px 20px;
    }
    .filter-grid {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
      gap: 14px;
    }
    .search-input-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-input-box i {
      position: absolute;
      left: 12px;
      color: var(--slate-400);
    }
    .search-input-box .form-control {
      padding-left: 36px;
    }
    .name-cell {
      display: flex;
      flex-direction: column;
    }
    .sub-cell {
      font-size: 0.75rem;
      color: var(--slate-500);
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .text-emerald { color: #059669; }
    @media (max-width: 900px) {
      .filter-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  departments: Department[] = [];
  loading = true;

  searchQuery = '';
  selectedDepartment = '';
  selectedBatch = '';
  selectedStatus = '';

  isModalOpen = false;
  isEditMode = false;
  modalSaving = false;
  currentStudent: any = {};

  isDeleteModalOpen = false;
  studentToDelete: Student | null = null;

  constructor(
    private studentService: StudentService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadStudents();
  }

  loadDepartments() {
    this.departmentService.getDepartments().subscribe({
      next: (res) => (this.departments = res.data)
    });
  }

  loadStudents() {
    this.loading = true;
    this.studentService
      .getStudents({
        search: this.searchQuery,
        department: this.selectedDepartment,
        batch: this.selectedBatch ? Number(this.selectedBatch) : undefined,
        placementStatus: this.selectedStatus
      })
      .subscribe({
        next: (res) => {
          this.students = res.data;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  onFilterChange() {
    this.loadStudents();
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentStudent = {
      batch: 2025,
      cgpa: 7.0,
      activeBacklogs: 0,
      historicalBacklogs: 0
    };
    this.isModalOpen = true;
  }

  openEditModal(student: Student) {
    this.isEditMode = true;
    this.currentStudent = {
      ...student,
      department: student.department?._id || student.department
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveStudent() {
    this.modalSaving = true;
    if (this.isEditMode) {
      this.studentService.updateStudent(this.currentStudent._id, this.currentStudent).subscribe({
        next: () => {
          this.notificationService.success('Student record updated successfully');
          this.modalSaving = false;
          this.closeModal();
          this.loadStudents();
        },
        error: () => (this.modalSaving = false)
      });
    } else {
      this.studentService.createStudent(this.currentStudent).subscribe({
        next: () => {
          this.notificationService.success('Student account registered successfully');
          this.modalSaving = false;
          this.closeModal();
          this.loadStudents();
        },
        error: () => (this.modalSaving = false)
      });
    }
  }

  confirmDelete(student: Student) {
    this.studentToDelete = student;
    this.isDeleteModalOpen = true;
  }

  handleDelete() {
    if (!this.studentToDelete) return;
    this.studentService.deleteStudent(this.studentToDelete._id).subscribe({
      next: () => {
        this.notificationService.success('Student account removed');
        this.isDeleteModalOpen = false;
        this.loadStudents();
      }
    });
  }
}
