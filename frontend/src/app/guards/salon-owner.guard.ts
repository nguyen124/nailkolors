import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const salonOwnerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.currentUser()?.role;
  if (role === 'salon_owner' || role === 'admin') return true;
  router.navigate(['/']);
  return false;
};
