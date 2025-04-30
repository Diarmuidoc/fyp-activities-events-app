import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GooglePlacesService } from '../../services/google-places.service';
import { Subscription, Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {GoogleMapsModule} from '@angular/google-maps';

@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
  ],
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.css']
})
export class ActivityDetailsComponent implements OnInit{

  placeDetails$: Observable<any>;
  isLoading = false;
  errorMessage: string | null = null;

  mapOptions: google.maps.MapOptions = {
    center: { lat: 53.3498, lng: -6.2603 },
    zoom: 14,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: true,
    draggableCursor: 'pointer',
    clickableIcons: false
  };
  mapCenter: google.maps.LatLngLiteral | undefined;
  markerPosition: google.maps.LatLngLiteral | undefined;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
  };
  mapZoom = 15;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placesService: GooglePlacesService
  ) {
    this.placeDetails$ = of(null);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.placeDetails$ = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
      }),
      switchMap(params => {
        const placeId = params.get('placeId');
        if (!placeId) {
          console.error('Place ID not found in route parameters.');
          this.errorMessage = 'Activity ID was not provided.';
          this.isLoading = false;
          return throwError(() => new Error('Place ID is missing'));
        }
        console.log(`Workspaceing details for Place ID: ${placeId}`);
        return this.placesService.getPlaceDetails(placeId);
      }),
      tap(details => {
        console.log("Received place details for map:", details);
        if (details?.geometry?.location) {
          const location = {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng
          };
          console.log("Setting map center and marker to:", location);
          // Update map properties
          this.mapCenter = location;
          this.markerPosition = location;
          this.mapZoom = 16; // Maybe zoom in a bit more
        } else {
          console.warn("Place details missing geometry information.");
        }
      }),
      catchError(error => {
        console.error('Error fetching place details in component:', error);
        this.errorMessage = error.message || 'Failed to load activity details.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        console.log("Place details fetch finalized (completed or errored).");
      })
    );

  }

  goBack(): void {
    this.router.navigate(['/activity']);
  }

  handleImageError(event: Event, photo: any): void {
    console.error('Failed to load image:', photo.imageUrl, event);
    (event.target as HTMLImageElement).src = '/assets/image-placeholder.png';
  }
}
