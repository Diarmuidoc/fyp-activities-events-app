import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private proxyUrl = 'http://localhost:3000/places'; // Use the proxy URL

  constructor(private http: HttpClient) {}

  // Function to get the current location using the Geolocation API
  private getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      // Check if Geolocation is supported
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      // Get current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[GooglePlacesService] Geolocation successful:', position.coords);
          observer.next(position); // Emit the position object
          observer.complete();    // Signal successful completion
        },
        (error) => {
          // Handle different geolocation errors
          let message = 'An unknown error occurred while getting location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'User denied the request for Geolocation.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'The request to get user location timed out.';
              break;
          }
          console.error('[GooglePlacesService] Geolocation error:', message, error);
          observer.error(new Error(message)); // Emit a standard Error object for consistency
        },
        { // Optional: Geolocation options
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0 // Force fresh location check
        }
      );
    });
  }

  // Method to get places based on current location
  getPlacesNearby(radius: number = 5000, type: string = 'restaurant'): Observable<any> {
    // 1. Get the current position
    return this.getCurrentPosition().pipe(
      // 2. Once position is received, switch to making the HTTP call
      switchMap(position => {
        const { latitude, longitude } = position.coords;

        // 3. Prepare query parameters for the backend proxy
        let params = new HttpParams()
          .set('lat', latitude.toString())
          .set('lng', longitude.toString())
          .set('radius', radius.toString())
          .set('type', type);

        console.log(`[GooglePlacesService] Calling proxy: ${this.proxyUrl} with params:`, params.toString());

        console.log(`Workspaceing places for lat: ${latitude}, lng: ${longitude}`); // For debugging

        // 4. Make the GET request to your backend proxy
        return this.http.get<any>(this.proxyUrl, { params });
      }),

      // 5. Handle potential errors (both geolocation and HTTP)
      catchError(error => {
        console.error('Error fetching places:', error);
        let errorMessage = 'Could not fetch places.';
        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
        } else if (typeof error === 'string') {
          errorMessage = error; // Handle the 'Geolocation not supported' case
        }
        // Re-throw the error or return a user-friendly error observable
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}






//old getNearbyPlaces
// getNearbyPlaces(lat: number, lng: number): Observable<any> {
//   return this.http.get(`${this.proxyUrl}?lat=${lat}&lng=${lng}`);
// }

// export class GooglePlacesService {
//   private apiKey = environment.googleMapsApiKey;
//   private apiUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
//
//   constructor(private http: HttpClient) {}
//
//   getNearbyPlaces(latitude: number, longitude: number, radius: number = 5000, type: string = 'restaurant'): Observable<any> {
//     const url = `${this.apiUrl}?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;
//     return this.http.get(url);
//   }
// }
