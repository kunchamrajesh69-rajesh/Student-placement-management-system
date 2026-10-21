import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { NotificationService } from '../../core/services/notification.service';
import { Department } from '../../core/models/department.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="departments-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Academic Departments & Branches</h1>
          <p class="page-subtitle">Configure engineering departments and streams for eligibility criteria</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="fa-solid fa-plus"></i>
          Add Department
        </button>
      </div>

      <div class="card table-card">
        <app-loading-spinner *ngIf="loading" message="Loading academic departments..."></app-loading-spinner>

        <div *ngIf="!loading && departments.length > 0" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Description</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dept of departments">
                <td>
                  <span class="badge badge-primary">{{ dept.code }}</span>
                </td>
                <td>
                  <strong>{{ dept.name }}</strong>
                </td>
                <td>
                  <span class="desc-text">{{ dept.description || 'No description provided' }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="dept.isActive ? 'badge-success' : 'badge-neutral'">
                    {{ dept.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" (click)="openEditModal(dept)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="deleteDepartment(dept)" style="margin-left: 6px;">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state
          *ngIf="!loading && departments.length === 0"
          icon="fa-solid fa-building-columns"
          title="No departments found"
          message="No academic departments are registered yet. Add one to enable drive eligibility filtering."
        ></app-empty-state>
      </div>

      <!-- Add/Edit Department Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">{{ isEditMode ? 'Edit Department' : 'Create Department' }}</h3>
            <button class="btn-close" (click)="closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveDepartment()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Department Code (Uppercase) *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="currentDept.code"
                  name="code"
                  required
                  placeholder="e.g. CSE, ECE, MECH"
                  [disabled]="isEditMode"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Department Full Name *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="currentDept.name"
                  name="name"
                  required
                  placeholder="e.g. Computer Science and Engineering"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Description / Scope</label>
                <textarea
                  class="form-control"
                  rows="3"
                  [(ngModel)]="currentDept.description"
                  name="description"
                  placeholder="Overview of specialization areas"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>{{ isEditMode ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .departments-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .desc-text { color: var(--slate-600); font-size: 0.8125rem; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
  `]
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  isModalOpen = false;
  isEditMode = false;
  modalSaving = false;
  currentDept: any = {};

  constructor(
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentDept = { code: '', name: '', description: '' };
    this.isModalOpen = true;
  }

  openEditModal(dept: Department) {
    this.isEditMode = true;
    this.currentDept = { ...dept };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveDepartment() {
    this.modalSaving = true;
    if (this.isEditMode) {
      this.departmentService.updateDepartment(this.currentDept._id, this.currentDept).subscribe({
        next: () => {
          this.notificationService.success('Department updated successfully');
          this.modalSaving = false;
          this.closeModal();
          this.loadDepartments();
        },
        error: () => (this.modalSaving = false)
      });
    } else {
      this.departmentService.createDepartment(this.currentDept).subscribe({
        next: () => {
          this.notificationService.success('Department created successfully');
          this.modalSaving = false;
          this.closeModal();
          this.loadDepartments();
        },
        error: () => (this.modalSaving = false)
      });
    }
  }

  deleteDepartment(dept: Department) {
    if (confirm(`Are you sure you want to deactivate ${dept.name}?`)) {
      this.departmentService.deleteDepartment(dept._id).subscribe({
        next: () => {
          this.notificationService.success('Department deactivated');
          this.loadDepartments();
        }
      });
    }
  }
}
