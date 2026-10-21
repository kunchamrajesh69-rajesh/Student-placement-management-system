import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-box">
      <div class="empty-icon">
        <i [class]="icon"></i>
      </div>
      <h4 class="empty-title">{{ title }}</h4>
      <p class="empty-desc">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: var(--radius-lg);
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }
    .empty-desc {
      font-size: 0.875rem;
      color: #64748b;
      max-width: 420px;
      margin-bottom: 20px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'fa-solid fa-folder-open';
  @Input() title = 'No records found';
  @Input() message = 'There is currently no data to display for this view.';
}
