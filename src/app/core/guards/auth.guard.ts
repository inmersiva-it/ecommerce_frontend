import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  
  const token = localStorage.getItem('token');
  if (token && !authService.isTokenExpired(token)) {
    return true;
  }
  
  // Clear any partial/expired session data and redirect to login
  authService.logout();
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  
  if (token && !authService.isTokenExpired(token)) {
    if (role === 'Administrador') {
      return true;
    }
    // If authenticated but not admin, redirect to store
    router.navigate(['/tienda']);
    return false;
  }
  
  authService.logout();
  return false;
};
