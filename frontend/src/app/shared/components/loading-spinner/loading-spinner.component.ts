import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrapper" [class.overlay]="overlay">
      <div class="spinner"></div>
      <p class="spinner-text" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
    }
    .spinner-wrapper.overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(2px);
      z-index: 50;
    }
    .spinner {
      width: 38px;
      height: 38px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() overlay = false;
}
