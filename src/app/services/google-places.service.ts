import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError, of, map} from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private proxyUrl = 'http://localhost:3000/places'; //proxy URL
  private detailsProxyBaseUrl = 'http://localhost:3000/api/place-details';

  constructor(private http: HttpClient) {}

  // Function to get the current location using the Geolocation API
  private getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      //Geolocator support
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[GooglePlacesService] Geolocation successful:', position.coords);
          observer.next(position); // Emit the position object
          observer.complete();    // Signal successful completion
        },
        (error) => {
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
          observer.error(new Error(message));
        },
        { //Geolocator options
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0
        }
      );
    });
  }


  getPlaceDetails(placeId: string): Observable<any> {
    if (!placeId) {
      return throwError(() => new Error('Place ID is required to fetch details.'));
    }

    const url = `${this.detailsProxyBaseUrl}/${placeId}`;

    console.log(`[GooglePlacesService] Calling proxy for details: ${url}`);

    return this.http.get<any>(url).pipe(
      tap(response => console.log('[GooglePlacesService] Received details response from proxy:', response)),
      map(response => {
        if (response && response.status === 'OK') {
          return response.result;
        } else {
          throw new Error(response.details || `Failed to get place details: Status ${response.status}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error instanceof HttpErrorResponse) {
      errorMessage = `Backend error: Code ${error.status}, Message: ${error.message || JSON.stringify(error.error)}`;
      if (error.error && error.error.details) {
        errorMessage += ` Details: ${error.error.details}`;
      }
    } else {
      {
        errorMessage = error.message;
      }
    }
    console.error('[GooglePlacesService] Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }


  getPlacesNearby(radius: number = 5000, type: string = 'restaurant'): Observable<any> {
    return this.getCurrentPosition().pipe(
      switchMap(position => {
        const { latitude, longitude } = position.coords;

        //parameters for the backend proxy
        let params = new HttpParams()
          .set('lat', latitude.toString())
          .set('lng', longitude.toString())
          .set('radius', radius.toString())
          .set('type', type);

        console.log(`[GooglePlacesService] Calling proxy: ${this.proxyUrl} with params:`, params.toString());

        console.log(`Workspaceing places for lat: ${latitude}, lng: ${longitude}`);

        //GET request to backend proxy
        return this.http.get<any>(this.proxyUrl, { params });
      }),

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
          errorMessage = error;
        }
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
