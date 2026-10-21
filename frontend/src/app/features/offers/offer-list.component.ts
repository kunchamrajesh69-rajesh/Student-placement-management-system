import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../../core/services/offer.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { Offer } from '../../core/models/offer.model';
import { Application } from '../../core/models/application.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="offers-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Placement Offers & Recruitment Results</h1>
          <p class="page-subtitle">Record official placement offers, packages, and candidate joining confirmations</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="fa-solid fa-award"></i>
          Issue Placement Offer
        </button>
      </div>

      <div class="card table-card">
        <app-loading-spinner *ngIf="loading" message="Loading placement offers..."></app-loading-spinner>

        <div *ngIf="!loading && offers.length > 0" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Company</th>
                <th>Designation</th>
                <th>Package (LPA)</th>
                <th>Offer Date</th>
                <th>Joining Date</th>
                <th>Offer Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let off of offers">
                <td>
                  <strong>{{ off.student?.fullName }}</strong>
                  <div class="sub-cell">{{ off.student?.rollNumber }} &bull; {{ off.student?.department?.code }}</div>
                </td>
                <td>
                  <strong>{{ off.company?.name }}</strong>
                </td>
                <td>{{ off.designation }}</td>
                <td>
                  <strong class="text-emerald">₹ {{ off.packageLPA }} LPA</strong>
                </td>
                <td>{{ off.offerDate | date: 'mediumDate' }}</td>
                <td>{{ off.joiningDate ? (off.joiningDate | date: 'mediumDate') : 'TBD' }}</td>
                <td>
                  <span class="badge" [ngClass]="off.status === 'Joined' ? 'badge-stage-joined' : (off.status === 'Accepted' ? 'badge-success' : (off.status === 'Declined' ? 'badge-danger' : 'badge-primary'))">
                    {{ off.status }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button
                    class="btn btn-success btn-sm"
                    *ngIf="off.status !== 'Joined'"
                    (click)="markJoined(off)"
                  >
                    <i class="fa-solid fa-check-double"></i> Mark Joined
                  </button>
                  <span *ngIf="off.status === 'Joined'" class="badge badge-success">Joined Org</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state
          *ngIf="!loading && offers.length === 0"
          icon="fa-solid fa-trophy"
          title="No placement offers issued yet"
          message="Once candidate interviews are completed, issue formal offers here to calculate placement statistics."
        ></app-empty-state>
      </div>

      <!-- Create Offer Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="isModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Issue Placement Offer</h3>
            <button class="btn-close" (click)="isModalOpen = false"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form (ngSubmit)="saveOffer()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Selected Candidate Application *</label>
                <select class="form-control" [(ngModel)]="newOffer.applicationId" name="appId" required>
                  <option value="" disabled>Select Candidate</option>
                  <option *ngFor="let app of eligibleApps" [value]="app._id">
                    {{ app.student?.fullName }} ({{ app.student?.rollNumber }}) &mdash; {{ app.jobDrive?.title }} ({{ app.jobDrive?.company?.name }})
                  </option>
                </select>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Job Role / Designation *</label>
                  <input type="text" class="form-control" [(ngModel)]="newOffer.designation" name="designation" required placeholder="e.g. Associate Software Engineer" />
                </div>
                <div class="form-group">
                  <label class="form-label">CTC Package (LPA) *</label>
                  <input type="number" step="0.1" class="form-control" [(ngModel)]="newOffer.packageLPA" name="packageLPA" required placeholder="14.5" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Expected Joining Date</label>
                  <input type="date" class="form-control" [(ngModel)]="newOffer.joiningDate" name="joiningDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Offer Letter Web Link / Doc</label>
                  <input type="url" class="form-control" [(ngModel)]="newOffer.offerLetterUrl" name="offerUrl" placeholder="https://storage.placement.edu/offers/sample.pdf" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Remarks / Special Terms</label>
                <textarea class="form-control" rows="2" [(ngModel)]="newOffer.remarks" name="remarks" placeholder="Bonus details, bond terms, or probation details"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" (click)="isModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="modalSaving">
                <i class="fa-solid fa-spinner fa-spin" *ngIf="modalSaving"></i>
                <span>Issue Offer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offers-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .sub-cell { font-size: 0.75rem; color: #64748b; }
    .text-emerald { color: #059669; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
  `]
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];
  eligibleApps: Application[] = [];
  loading = true;

  isModalOpen = false;
  modalSaving = false;
  newOffer: any = {};

  constructor(
    private offerService: OfferService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOffers();
    this.applicationService.getApplications().subscribe({
      next: (res) => (this.eligibleApps = res.data)
    });
  }

  loadOffers() {
    this.loading = true;
    this.offerService.getOffers().subscribe({
      next: (res) => {
        this.offers = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openCreateModal() {
    this.newOffer = {
      applicationId: '',
      designation: '',
      packageLPA: 10.0
    };
    this.isModalOpen = true;
  }

  saveOffer() {
    this.modalSaving = true;
    this.offerService.createOffer(this.newOffer).subscribe({
      next: () => {
        this.notificationService.success('Placement offer issued successfully');
        this.modalSaving = false;
        this.isModalOpen = false;
        this.loadOffers();
      },
      error: () => (this.modalSaving = false)
    });
  }

  markJoined(offer: Offer) {
    if (confirm(`Confirm that ${offer.student?.fullName} has joined ${offer.company?.name}?`)) {
      this.offerService.updateOfferStatus(offer._id, 'Joined').subscribe({
        next: () => {
          this.notificationService.success('Candidate status marked as Joined & Placed');
          this.loadOffers();
        }
      });
    }
  }
}
