import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="card-title">{{ title }}</h3>
          <button class="btn-close" (click)="onCancel()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-text">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" (click)="onCancel()">
            Cancel
          </button>
          <button type="button" [class]="'btn btn-sm ' + confirmBtnClass" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .btn-close:hover {
      color: #0f172a;
    }
    .modal-text {
      color: #475569;
      font-size: 0.9375rem;
      line-height: 1.5;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed with this action?';
  @Input() confirmText = 'Confirm';
  @Input() confirmBtnClass = 'btn-danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
