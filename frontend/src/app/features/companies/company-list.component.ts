import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { NotificationService } from '../../core/services/notification.service';
import { Company } from '../../core/models/company.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="companies-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Recruiting Partners & Companies</h1>
          <p class="page-subtitle">Manage corporate relations, hiring partner profiles, and verified HR contacts</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="fa-solid fa-plus"></i>
          Add Company Partner
        </button>
      </div>

      <!-- Companies Grid -->
      <app-loading-spinner *ngIf="loading" message="Loading partner companies..."></app-loading-spinner>

      <div *ngIf="!loading && companies.length > 0" class="grid-3">
        <div *ngFor="let c of companies" class="card company-card">
          <div class="company-card-header">
            <div class="comp-icon">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <div class="comp-title-area">
              <h3 class="comp-name">{{ c.name }}</h3>
              <span class="badge badge-neutral">{{ c.industry }}</span>
            </div>
          </div>

          <p class="comp-desc">{{ c.description || 'Global corporate recruitment partner.' }}</p>

          <div class="comp-details-list">
            <div class="detail-item" *ngIf="c.website">
              <i class="fa-solid fa-globe"></i>
              <a [href]="c.website" target="_blank" rel="noopener">{{ c.website }}</a>
            </div>
            <div class="detail-item" *ngIf="c.address?.city">
              <i class="fa-solid fa-location-dot"></i>
              <span>{{ c.address?.city }}, {{ c.address?.state }}</span>
            </div>
          </div>

          <!-- HR Contacts Section (Admin Only) -->
          <div class="hr-section" *ngIf="c.hrContacts && c.hrContacts.length > 0">
            <span class="hr-label"><i class="fa-solid fa-address-book"></i> HR Contacts</span>
            <div *ngFor="let hr of c.hrContacts" class="hr-item">
              <div class="hr-name">{{ hr.name }} <span class="hr-desig">({{ hr.designation || 'HR' }})</span></div>
              <div class="hr-contact-info">{{ hr.email }} &bull; {{ hr.phone }}</div>
            </div>
          </div>

          <div class="comp-card-footer">
            <span class="badge" [ngClass]="c.status === 'Active' ? 'badge-success' : 'badge-danger'">
              {{ c.status }}
            </span>
            <div class="footer-buttons">
              <button class="btn btn-secondary btn-sm" (click)="openEditModal(c)">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button class="btn btn-danger btn-sm" (click)="deleteCompany(c)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && companies.length === 0"
        icon="fa-solid fa-building"
        title="No recruiting partners found"
        message="Add partner companies to start publishing job placement drives."
      ></app-empty-state>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">{{ isEditMode ? 'Edit Company Profile' : 'Add Recruiting Company' }}</h3>
            <button class="btn-close" (click)="closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveCompany()">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Company Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCompany.name" name="name" required placeholder="e.g. Google LLC" />
                </div>
                <div class="form-group">
                  <label class="form-label">Industry Domain *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCompany.industry" name="industry" required placeholder="e.g. Software & Cloud" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Website URL</label>
                  <input type="url" class="form-control" [(ngModel)]="currentCompany.website" name="website" placeholder="https://careers.company.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-control" [(ngModel)]="currentCompany.status" name="status">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Company Overview / Description</label>
                <textarea class="form-control" rows="3" [(ngModel)]="currentCompany.description" name="description"></textarea>
              </div>

              <!-- HR Contact Form Fields -->
              <h4 style="font-size: 0.9375rem; margin-top: 16px; margin-bottom: 10px; color: var(--slate-700);">
                Primary HR Contact
              </h4>
              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">HR Name</label>
                  <input type="text" class="form-control" [(ngModel)]="primaryHr.name" name="hrName" placeholder="e.g. Sarah Jenkins" />
                </div>
                <div class="form-group">
                  <label class="form-label">HR Email</label>
                  <input type="email" class="form-control" [(ngModel)]="primaryHr.email" name="hrEmail" placeholder="sarah.hr@company.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">HR Phone</label>
                  <input type="text" class="form-control" [(ngModel)]="primaryHr.phone" name="hrPhone" placeholder="+91 9876543210" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>{{ isEditMode ? 'Update Partner' : 'Save Partner' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .companies-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .company-card { display: flex; flex-direction: column; justify-content: space-between; }
    .company-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .comp-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .comp-name { font-size: 1.0625rem; color: #0f172a; margin-bottom: 2px; }
    .comp-desc { font-size: 0.8125rem; color: #64748b; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .comp-details-list { display: flex; flex-direction: column; gap: 6px; font-size: 0.8125rem; margin-bottom: 14px; color: #475569; }
    .detail-item { display: flex; align-items: center; gap: 8px; }
    .hr-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 10px 12px; margin-bottom: 16px; font-size: 0.75rem; }
    .hr-label { font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }
    .hr-name { font-weight: 600; color: #0f172a; }
    .hr-desig { font-weight: normal; color: #64748b; }
    .hr-contact-info { color: #64748b; }
    .comp-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .footer-buttons { display: flex; gap: 6px; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
  `]
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  loading = true;
  isModalOpen = false;
  isEditMode = false;
  modalSaving = false;
  currentCompany: any = {};
  primaryHr: any = {};

  constructor(
    private companyService: CompanyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        this.companies = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentCompany = { status: 'Active' };
    this.primaryHr = { name: '', email: '', phone: '', designation: 'University Relations Lead' };
    this.isModalOpen = true;
  }

  openEditModal(comp: Company) {
    this.isEditMode = true;
    this.currentCompany = { ...comp };
    if (comp.hrContacts && comp.hrContacts.length > 0) {
      this.primaryHr = { ...comp.hrContacts[0] };
    } else {
      this.primaryHr = { name: '', email: '', phone: '', designation: '' };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCompany() {
    this.modalSaving = true;
    const payload = { ...this.currentCompany };
    if (this.primaryHr.name && this.primaryHr.email) {
      payload.hrContacts = [this.primaryHr];
    }

    if (this.isEditMode) {
      this.companyService.updateCompany(this.currentCompany._id, payload).subscribe({
        next: () => {
          this.notificationService.success('Company profile updated');
          this.modalSaving = false;
          this.closeModal();
          this.loadCompanies();
        },
        error: () => (this.modalSaving = false)
      });
    } else {
      this.companyService.createCompany(payload).subscribe({
        next: () => {
          this.notificationService.success('Company profile registered');
          this.modalSaving = false;
          this.closeModal();
          this.loadCompanies();
        },
        error: () => (this.modalSaving = false)
      });
    }
  }

  deleteCompany(comp: Company) {
    if (confirm(`Are you sure you want to delete ${comp.name}?`)) {
      this.companyService.deleteCompany(comp._id).subscribe({
        next: () => {
          this.notificationService.success('Company deleted successfully');
          this.loadCompanies();
        }
      });
    }
  }
}
