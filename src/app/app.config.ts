import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {environment, firebaseConfig} from '../environments/environment';

import routeConfig from './routes'
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaV3Provider , provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {provideHttpClient} from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    { provide: 'GOOGLE_MAPS_API_KEY', useValue: environment.googleMapsApiKey },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routeConfig),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    provideAppCheck(() =>
      initializeAppCheck(initializeApp(firebaseConfig), {
        provider: new ReCaptchaV3Provider(environment.recaptchaKey),
        isTokenAutoRefreshEnabled: true, // Automatically refresh tokens
      })
    ),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),

  ]
};
