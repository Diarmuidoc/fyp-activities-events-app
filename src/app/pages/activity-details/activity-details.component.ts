import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, throwError, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { GoogleMap } from '@angular/google-maps';
import { environment } from '../../../environments/environment'; // Adjust path as needed

@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.css']
})
export class ActivityDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap) map!: GoogleMap;
  placeDetails: any = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private routeSub: Subscription | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const placeId = params.get('placeId');

        if (!placeId) {
          this.isLoading = false;
          this.errorMessage = 'No Activity ID provided in the URL.';
          console.error(this.errorMessage);
          return throwError(() => new Error('No Place ID found'));
        }

        return new Observable((observer) => {
          if (this.map && this.map.googleMap) {
            this.placesService = new google.maps.places.PlacesService(this.map.googleMap);
            const request: google.maps.places.PlaceDetailsRequest = {
              placeId: placeId,
              fields: ['name', 'formatted_address', 'rating', 'website', 'photos', 'reviews'],
            };
            // @ts-ignore
            this.placesService.getDetails(request, (place, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                observer.next(place);
                observer.complete();
              } else {
                observer.error(status);
              }
            });
          } else {
            observer.error('Google Map not initialized.');
          }
        });
      })
    ).subscribe({
      next: (details) => {
        console.log('Received place details:', details);
        this.placeDetails = details;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching place details:', err);
        this.errorMessage = 'Could not load activity details. Please try again later.';
        if (err && err.message === 'No Place ID found') {
          this.errorMessage = 'Invalid activity link.';
        }
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  getPhotoUrl(photoReference: string): string {
    const apiKey = environment.googleMapsApiKey;
    if (!apiKey || !photoReference) return '';
    const maxWidth = 800;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
  }
}
