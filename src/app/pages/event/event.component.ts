import { Component, OnInit, inject } from '@angular/core'; // Import OnInit and inject
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient and HttpClientModule
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {MatAnchor} from '@angular/material/button'; // Import Observable for type hinting

// Define an interface for the expected event structure (optional but good practice)
interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  images: { url: string }[];
  dates: {
    start: {
      localDate: string;
      localTime?: string; // Time might not always be present
    };
  };
  _embedded?: { // Optional embedded data
    venues?: { name: string; city?: { name: string }; address?: { line1?: string } }[];
  };
  // Add other properties you might need from the API response
}

// Define an interface for the API response structure
interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  // Add other top-level properties if needed (like pagination '_links')
}


@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    HttpClientModule,
    MatAnchor,
    // Add HttpClientModule here for standalone components
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent implements OnInit { // Implement OnInit
  // Use the HttpClient injectable
  private http = inject(HttpClient);

  // Initialize events as an empty array or specific type
  events: TicketmasterEvent[] = []; // Use the interface type
  isLoading = false; // Flag to show a loading indicator
  error: string | null = null; // To store potential error messages

  // Define the location - you could make this dynamic later (e.g., user input)
  //Protected, gives error if not protected
  protected locationCity = 'Wexford'; // Example city

  ngOnInit(): void {
    // Fetch events when the component initializes
    this.fetchEvents(this.locationCity);
  }

  /**
   * Fetches events from the Ticketmaster API for a given city.
   * @param city The name of the city to search for events.
   */
  fetchEvents(city: string): void {
    const apiKey = environment.ticketmasterKey;
    // Construct the API URL - use discovery endpoint
    // You can add more parameters like countryCode=IE, classificationName=Music, etc.
    // See Ticketmaster API docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&countryCode=IE&sort=date,asc`; // Added countryCode and sorting

    console.log('Fetching events from:', url); // Log the URL for debugging

    this.isLoading = true; // Set loading state
    this.error = null; // Reset error state

    this.http.get<TicketmasterResponse>(url).subscribe({
      next: (response) => {
        // Check if the response has the expected structure
        if (response && response._embedded && response._embedded.events) {
          this.events = response._embedded.events;
          console.log('Events received:', this.events); // Log the received events
        } else {
          // Handle cases where no events are found or response structure is different
          this.events = [];
          console.log('No events found or unexpected response structure.');
        }
        this.isLoading = false; // Turn off loading state
      },
      error: (err) => {
        console.error('Error fetching events:', err); // Log the error
        this.error = 'Failed to fetch events. Please try again later.'; // Set error message
        this.isLoading = false; // Turn off loading state
        this.events = []; // Clear events on error
      },
      complete: () => {
        console.log('Event fetching completed.'); // Optional: log completion
      }
    });
  }

  /**
   * Fetches events from the Ticketmaster API based on latitude and longitude.
   * @param latitude The latitude of the location.
   * @param longitude The longitude of the location.
   */
  fetchEventsByCoordinates(latitude: number, longitude: number): void {
    const apiKey = environment.ticketmasterKey;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&latlong=${latitude},${longitude}&radius=50&unit=km&sort=date,asc`; // Example: within 50km

    console.log('Fetching events from coordinates:', url);

    this.isLoading = true;
    this.error = null;

    this.http.get<TicketmasterResponse>(url).subscribe({
      next: (response) => {
        if (response && response._embedded && response._embedded.events) {
          this.events = response._embedded.events;
          console.log('Events received:', this.events);
        } else {
          this.events = [];
          console.log('No events found or unexpected response structure.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.error = 'Failed to fetch events. Please try again later.';
        this.isLoading = false;
        this.events = [];
      },
      complete: () => {
        console.log('Event fetching completed.');
      },
    });
  }

  // Helper function to get the primary image URL safely
  getEventImageUrl(event: TicketmasterEvent): string {
    // Find the image with the best aspect ratio or the first one
    return event.images?.find(img => img.url)?.url || 'https://via.placeholder.com/300x169?text=No+Image'; // Provide a default placeholder
  }

  // Helper function to get venue name safely
  getVenueName(event: TicketmasterEvent): string {
    return event._embedded?.venues?.[0]?.name || 'Venue TBC';
  }

  // Helper function to get event date safely
  getEventDate(event: TicketmasterEvent): string {
    return event.dates?.start?.localDate || 'Date TBC';
  }

  // Helper function to get event time safely
  getEventTime(event: TicketmasterEvent): string {
    // @ts-ignore
    return event.dates?.start?.localTime ? new Date(`1970-01-01T${event.dates.start.localTime}Z`).toLocaleTimeString({}, {hour: '2-digit', minute:'2-digit', hour12: true}) : 'Time TBC';
  }
}
