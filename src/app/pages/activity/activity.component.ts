import { Component, OnInit } from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import {NgForOf} from '@angular/common';
import {GooglePlacesService} from '../../services/google-places.service';
import {environment} from '../../../environments/environment';



@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    CommonModule,
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})

export class ActivityComponent implements OnInit {
  places: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  //Move to backend
  private apiKey = environment.googleMapsApiKey;

  constructor(private googlePlacesService: GooglePlacesService) {
    if (!this.apiKey) {
      console.error("ERROR: Google Places API Key is not configured in environment variables!");
      this.errorMessage = "Application configuration error. API key is missing.";
    }
  }

  ngOnInit(): void {
    if (this.apiKey) {
      this.fetchActivities();
    }
  }


  fetchActivities(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.places = []; // Clear previous results

    this.googlePlacesService.getPlacesNearby(5000, 'tourist_attraction')
      .subscribe({
        // Use 'any' for the data type since no interface is defined
        next: (data: any) => {
          console.log('Received places data:', data); // For debugging
          // Ensure data.results exists and is an array before assigning
          this.places = data && data.results && Array.isArray(data.results) ? data.results : [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching places in component:', error);
          // Provide a user-friendly error message
          this.errorMessage = 'Failed to load activities. Please try again later.';
          if (error.status === 0) {
            this.errorMessage = 'Network error. Please check your connection.';
          } else if (error.error && typeof error.error.message === 'string') {
            // Use specific error from backend if available
            this.errorMessage = error.error.message;
          }
          this.isLoading = false;
        }
      });
  }


  getPhotoUrl(photoReference: string): string {
    const maxWidth = 400; // Or make this configurable
    // --- Construct the URL safely using the API key from environment ---
    // Ensure the photoReference is actually a string before using it
    if (typeof photoReference !== 'string' || !this.apiKey) {
      console.warn('Invalid photoReference or missing API key for getPhotoUrl');
      // Return a placeholder or empty string to prevent errors
      return ''; // Or path to a local placeholder image asset
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  //Used in different version
  onImageError(event: Event): void {
    const failedImageUrl = (event.target as HTMLImageElement)?.src;
    console.warn('Image failed to load:', failedImageUrl);
    // Optional: Hide the broken image or replace its src with a placeholder
    // (event.target as HTMLImageElement).style.display = 'none';
    // (event.target as HTMLImageElement).src = 'path/to/your/placeholder.png';
  }

}
