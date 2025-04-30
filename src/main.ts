import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import routeConfig from './app/routes'
import {appConfig} from './app/app.config';



(self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;


function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-script')) {
      resolve(); // Script is already loaded
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));

    document.head.appendChild(script);
  });
}


function getGoogleMapsApiKey(): string | undefined {
  const provider = appConfig.providers.find(
    (p: any) => typeof p === 'object' && 'provide' in p && p.provide === 'GOOGLE_MAPS_API_KEY'
  );
  return provider && 'useValue' in provider ? provider.useValue : undefined;
}


loadGoogleMapsScript()
  .then(() => {
    bootstrapApplication(AppComponent, {
      providers: [
        ...appConfig.providers,
        provideRouter(routeConfig)
      ]
    });
  })
  .catch(error => console.error('Google Maps API failed to load:', error));


bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

