import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-services';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, filter, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isLoading).pipe(
    filter(loading => !loading), // Attend que le chargement soit terminé
    take(1), // Prend la première valeur
    map(() => {
      if (authService.isLoggedIn()) {
        return true; 
      }
      console.log('Accès refusé → Redirection vers /login');
      router.navigate(['/login']);
      return false; 
    })
  );
};