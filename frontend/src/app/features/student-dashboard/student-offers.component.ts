import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferService } from '../../core/services/offer.service';
import { NotificationService } from '../../core/services/notification.service';
import { Offer } from '../../core/models/offer.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-student-offers',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="offers-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Campus Placement Offers</h1>
          <p class="page-subtitle">Official offers issued by corporate recruitment partners</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your placement offers..."></app-loading-spinner>

      <div *ngIf="!loading && offers.length > 0" class="grid-2 offers-grid">
        <div *ngFor="let off of offers" class="card offer-card">
          <div class="offer-top">
            <div>
              <span class="comp-tag">{{ off.company.name }}</span>
              <h3 class="role-title">{{ off.designation }}</h3>
            </div>
            <span [class]="'badge badge-stage-' + off.status.toLowerCase()">
              {{ off.status }}
            </span>
          </div>

          <div class="package-highlight">
            <span class="p-label">Annual CTC Package</span>
            <div class="p-val">₹ {{ off.packageLPA }} <span class="unit">Lakhs Per Annum</span></div>
          </div>

          <div class="details-list">
            <div class="detail-row" *ngIf="off.joiningDate">
              <span class="d-label">Tentative Joining:</span>
              <span class="d-val">{{ off.joiningDate | date: 'longDate' }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">Offer Issued On:</span>
              <span class="d-val">{{ off.offerDate | date: 'mediumDate' }}</span>
            </div>
            <div class="detail-row" *ngIf="off.offerLetterUrl">
              <span class="d-label">Offer Letter:</span>
              <a [href]="off.offerLetterUrl" target="_blank" rel="noopener" class="d-link">
                <i class="fa-solid fa-file-pdf"></i> Download Official Letter
              </a>
            </div>
            <div class="detail-row" *ngIf="off.remarks">
              <span class="d-label">Notes:</span>
              <span class="d-val">{{ off.remarks }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="offer-actions" *ngIf="off.status === 'Offered'">
            <button class="btn btn-success btn-sm" (click)="respond(off, 'Accepted')">
              <i class="fa-solid fa-check"></i> Accept Offer
            </button>
            <button class="btn btn-danger btn-sm" (click)="respond(off, 'Declined')">
              <i class="fa-solid fa-xmark"></i> Decline
            </button>
          </div>

          <div class="offer-confirmed-banner" *ngIf="off.status === 'Accepted' || off.status === 'Joined'">
            <i class="fa-solid fa-circle-check text-emerald"></i>
            <span>Offer confirmed! Congratulations on your campus placement.</span>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && offers.length === 0"
        icon="fa-solid fa-award"
        title="No placement offers yet"
        message="Your placement offers and appointment details will be visible here once released by the placement cell."
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .offers-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .offer-card { display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid #10b981; }
    .offer-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .comp-tag { font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .role-title { font-size: 1.125rem; color: #0f172a; margin-top: 2px; }
    .package-highlight { background: #ecfdf5; border: 1px solid #d1fae5; border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px; text-align: center; }
    .p-label { font-size: 0.75rem; color: #065f46; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .p-val { font-size: 1.75rem; font-weight: 800; font-family: var(--font-display); color: #047857; margin-top: 2px; }
    .unit { font-size: 0.875rem; font-weight: 600; color: #065f46; }
    .details-list { display: flex; flex-direction: column; gap: 8px; font-size: 0.8125rem; margin-bottom: 20px; }
    .detail-row { display: flex; justify-content: space-between; }
    .d-label { color: #64748b; font-weight: 500; }
    .d-val { color: #1e293b; font-weight: 600; }
    .d-link { color: #2563eb; font-weight: 600; }
    .offer-actions { display: flex; gap: 10px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .offer-confirmed-banner { display: flex; align-items: center; gap: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); padding: 10px 14px; font-size: 0.8125rem; color: #065f46; font-weight: 600; margin-top: 12px; }
  `]
})
export class StudentOffersComponent implements OnInit {
  offers: Offer[] = [];
  loading = true;

  constructor(
    private offerService: OfferService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOffers();
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

  respond(off: Offer, status: 'Accepted' | 'Declined') {
    if (confirm(`Are you sure you want to ${status.toUpperCase()} this placement offer?`)) {
      this.offerService.updateOfferStatus(off._id, status).subscribe({
        next: () => {
          this.notificationService.success(`Offer response recorded: ${status}`);
          this.loadOffers();
        }
      });
    }
  }
}
