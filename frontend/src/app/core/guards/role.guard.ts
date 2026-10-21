import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data?.['role'] as string;
  const currentUser = authService.currentUserValue;

  if (currentUser && currentUser.role === expectedRole) {
    return true;
  }

  // If wrong role, redirect to appropriate default landing
  if (currentUser?.role === 'admin') {
    return router.createUrlTree(['/admin/dashboard']);
  } else if (currentUser?.role === 'student') {
    return router.createUrlTree(['/student/dashboard']);
  }

  return router.createUrlTree(['/login']);
};
