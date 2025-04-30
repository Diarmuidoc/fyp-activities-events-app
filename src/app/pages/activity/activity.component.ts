import { Component, OnInit, OnDestroy, inject  } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { GooglePlacesService } from '../../services/google-places.service';
import { RouterLink } from '@angular/router';
import {Subscription, Observable, map} from 'rxjs';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardModule
} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import { Auth, authState } from '@angular/fire/auth';
import {SavedActivity, UserListService} from '../../services/user-list.service';


@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatCardImage,
    MatCardModule,
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})

export class ActivityComponent implements OnInit, OnDestroy {
  places: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private placesSubscription: Subscription | null = null; // To hold the subscription
  private userListService = inject(UserListService);
  private auth = inject(Auth);
  isLoggedIn$: Observable<boolean>;

  //Try get working
  savedActivityIds: Set<string> = new Set<string>(); // To track saved activities


  constructor(private googlePlacesService: GooglePlacesService) {
    // Constructor is now simpler, just injects the service
    console.log("ActivityComponent initialized");
    this.isLoggedIn$ = authState(this.auth).pipe(map(user => !!user));
  }

  ngOnInit(): void {
    this.fetchActivities();
  }


  ngOnDestroy(): void {
    if (this.placesSubscription) {
      this.placesSubscription.unsubscribe();
      console.log("Unsubscribed from places observable.");
    }
  }

  fetchActivities(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.places = [];

    console.log("Calling getPlacesNearby service method...");

    // Store the subscription
    this.placesSubscription = this.googlePlacesService.getPlacesNearby(10000, 'tourist_attraction') // 10km radius, tourist attractions
      .subscribe({
        next: (data: any) => {
          console.log('[ActivityComponent] Received data from service:', data);
          if (data && data.results && Array.isArray(data.results)) {
            this.places = data.results;
            console.log(`Assigned ${this.places.length} places.`);
            if (this.places.length === 0) {
              console.log("Received zero results from API.");
            }
          } else if (data && data.status === 'ZERO_RESULTS') {
            this.places = []; // Ensure places is empty array
            console.log("Received ZERO_RESULTS status from API.");
          }
          else {
            console.warn('[ActivityComponent] Unexpected data structure received:', data);
            this.places = [];
            this.errorMessage = 'Received unexpected data format from the server.';
          }
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('[ActivityComponent] Error fetching places:', error);
          this.errorMessage = error.message || 'Failed to load activities due to an unknown error.';
          this.isLoading = false;
          this.places = []; // Clear places on error
        },
        complete: () => {
          console.log("[ActivityComponent] Places observable completed.");
          this.isLoading = false;
        }
      });
  }

  retryFetch(): void {
    console.log("Retrying fetch activities...");
    this.fetchActivities();
  }


  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.warn('Image failed to load:', target?.src);
    target.style.display = 'none';
  }

  isActivityAlreadySaved(placeId: string): boolean {
    return this.savedActivityIds.has(placeId);
  }

  async saveActivity(place: any): Promise<void> {
    if (!this.auth.currentUser) {
      alert('Please log in to save activities.');
      return;
    }
    if (!place || !place.place_id) {
      console.error("Cannot save place without place_id:", place);
      alert("Could not save this activity.");
      return;
    }

    const activityToSave: SavedActivity = {
      place_id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      imageUrl: place.imageUrl || null // Use the imageUrl added by the proxy
    };

    try {
      await this.userListService.addActivity(activityToSave);
      alert(`${place.name} saved successfully!`);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert(`Failed to save ${place.name}. Please try again.`);
    }
  }

}
