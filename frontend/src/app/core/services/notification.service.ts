import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  show(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, durationMs = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(message: string, title = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error') {
    this.show('error', message, title);
  }

  info(message: string, title = 'Notice') {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Warning') {
    this.show('warning', message, title);
  }

  remove(id: string) {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }
}
