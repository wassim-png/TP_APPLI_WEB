import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserDto } from '../types/user-dto';
import { environment } from '../../environments/environments';
import { catchError, finalize, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly _users = signal<UserDto[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadAll() {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<UserDto[]>(
      `${environment.apiUrl}/users`,
      { withCredentials: true }
    ).pipe(
      tap(users => {
        this._users.set(users);
        console.log(`OK: ${users.length} utilisateurs chargés`);
      }),
      catchError(err => {
        console.error(' Erreur lors du chargement des utilisateurs', err);
        this._error.set('Impossible de charger les utilisateurs');
        this._users.set([]);
        return of([]);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }
}
