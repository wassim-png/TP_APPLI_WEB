import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/auth/auth-services';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, filter, take } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isLoading).pipe(
    filter(loading => !loading), // Attend que le chargement soit terminé
    take(1), // Prend la première valeur
    map(() => {
      if (authService.isAdmin()) {
        return true; 
      }
      console.log('Accès refusé (non admin) → Redirection vers /home');
      router.navigate(['/home']);
      return false;
    })
  );
};