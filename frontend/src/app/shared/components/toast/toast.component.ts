import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(toasts$ | async) as toasts">
      <div
        *ngFor="let toast of toasts"
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
        (click)="remove(toast.id)"
      >
        <div class="toast-icon">
          <i class="fa-solid fa-circle-check" *ngIf="toast.type === 'success'"></i>
          <i class="fa-solid fa-circle-xmark" *ngIf="toast.type === 'error'"></i>
          <i class="fa-solid fa-triangle-exclamation" *ngIf="toast.type === 'warning'"></i>
          <i class="fa-solid fa-circle-info" *ngIf="toast.type === 'info'"></i>
        </div>
        <div class="toast-content">
          <strong class="toast-title" *ngIf="toast.title">{{ toast.title }}</strong>
          <p class="toast-msg">{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="remove(toast.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      width: 100%;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: var(--radius-md);
      background: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-left: 5px solid #3b82f6;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;
    }

    .toast-item:hover {
      transform: translateY(-2px);
    }

    .toast-success { border-left-color: #10b981; }
    .toast-error { border-left-color: #ef4444; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-info { border-left-color: #3b82f6; }

    .toast-icon {
      font-size: 1.25rem;
      margin-top: 2px;
    }
    .toast-success .toast-icon { color: #10b981; }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info .toast-icon { color: #3b82f6; }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      display: block;
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .toast-msg {
      font-size: 0.8125rem;
      color: #475569;
      line-height: 1.4;
      margin: 0;
    }

    .toast-close {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
    }
    .toast-close:hover {
      color: #0f172a;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  private notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  remove(id: string) {
    this.notificationService.remove(id);
  }
}
