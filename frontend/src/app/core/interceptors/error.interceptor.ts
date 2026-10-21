import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error?.error?.message) {
        errorMessage = error.error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle Unauthorized status
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logoutLocal();
        notificationService.error('Session expired. Please log in again.', 'Unauthorized');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        notificationService.error(errorMessage, 'Access Denied');
      } else if (error.status >= 400 && error.status < 500) {
        notificationService.error(errorMessage, 'Request Failed');
      } else if (error.status >= 500) {
        notificationService.error('Server error encountered. Please contact administrator.', 'Server Error');
      }

      return throwError(() => error);
    })
  );
};
