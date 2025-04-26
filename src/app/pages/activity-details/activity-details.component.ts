import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute and Router
import { GooglePlacesService } from '../../services/google-places.service'; // Import the service
import { Subscription, Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Import CommonModule for standalone

@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [CommonModule], // Needed for *ngIf, *ngFor, async pipe etc.
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.css']
})
export class ActivityDetailsComponent implements OnInit, OnDestroy {

  placeDetails$: Observable<any>; // Observable to hold place details
  isLoading = false;
  errorMessage: string | null = null;

  // Keep track of subscription if needed, though async pipe is often better
  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute to get route params
    private router: Router,       // Inject Router for potential navigation
    private placesService: GooglePlacesService // Inject your service
  ) {
    // Initialize with an observable emitting null
    this.placeDetails$ = of(null);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Use paramMap observable (preferred way)
    this.placeDetails$ = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true; // Set loading true when params change/start
        this.errorMessage = null;
      }),
      switchMap(params => {
        const placeId = params.get('placeId'); // Get placeId from route parameters
        if (!placeId) {
          console.error('Place ID not found in route parameters.');
          this.errorMessage = 'Activity ID was not provided.';
          this.isLoading = false;
          // Navigate back or show error, return an empty/error observable
          // this.router.navigate(['/activities']); // E
          // xample navigation back
          return throwError(() => new Error('Place ID is missing'));
        }
        console.log(`Workspaceing details for Place ID: ${placeId}`);
        // Call the service method
        return this.placesService.getPlaceDetails(placeId); // This returns Observable<any>
      }),
      tap(details => { // Optional: Log successful fetch
        console.log("Received place details:", details);
      }),
      catchError(error => {
        console.error('Error fetching place details in component:', error);
        this.errorMessage = error.message || 'Failed to load activity details.';
        // Return an observable emitting null or an empty object on error
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false; // Ensure loading is set to false when observable completes or errors
        console.log("Place details fetch finalized (completed or errored).");
      })
    );

    /* // Alternative: Snapshot (works only if component is always destroyed/recreated on param change)
    const placeId = this.route.snapshot.paramMap.get('placeId');
    if (placeId) {
        // Call service... (less robust if navigating between details pages)
    } else {
        // Handle error
    }
    */
  }

  ngOnDestroy(): void {
    // If you manually subscribed to route.paramMap (not needed with async pipe pattern above)
    // if (this.routeSub) {
    //   this.routeSub.unsubscribe();
    // }
  }

  // Helper to go back to the list view
  goBack(): void {
    this.router.navigate(['/activity']); // Navigate to the activities list page
  }

  handleImageError(event: Event, photo: any): void {
    console.error('Failed to load image:', photo.imageUrl, event);
    // Optionally, set a placeholder image:
    (event.target as HTMLImageElement).src = '/assets/image-placeholder.png';
  }
}
