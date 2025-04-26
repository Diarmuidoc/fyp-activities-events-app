// src/app/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth'; // Import Auth and authState
import { map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth: Auth = inject(Auth); // Inject Firebase Auth service
  const router: Router = inject(Router); // Inject Router

  // Use authState observable to check login status reactively
  return authState(auth).pipe(
    take(1), // Take the first emission to avoid ongoing subscription
    map(user => !!user), // Map the user object to a boolean (true if logged in, false otherwise)
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

// --- Alternative using AngularFire's built-in pipeable operators (Simpler if only redirect needed) ---
/*
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard'; // Import AuthGuard helper

export const authGuard: CanActivateFn = (route, state) => {
  // This uses a pre-built pipeable operator from AngularFire Auth Guard
  // It automatically checks auth state and redirects if unauthorized
  const redirect = () => redirectUnauthorizedTo(['/login']);
  return inject(AuthGuard).pipe(redirect()); // Inject AuthGuard service and apply the redirect logic
};
*/
