import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth: Auth = inject(Auth);
  const router: Router = inject(Router);

  return authState(auth).pipe(
    take(1), // Take 1 to avoid ongoing subscription
    map(user => !!user),
    tap(loggedIn => {
      if (!loggedIn) {
        console.log('Access denied - Redirecting to login');
        // Redirect to the login page if not logged in
        router.navigate(['/user-login']);
      } else {
        console.log('Access granted');
      }
    })
  );
};
