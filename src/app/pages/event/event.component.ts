import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Observable, of} from 'rxjs';
import {MatAnchor} from '@angular/material/button';
import {catchError} from 'rxjs/operators';


interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  images: { url: string }[];
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: { // Optional embedded data
    venues?: { name: string; city?: { name: string }; address?: { line1?: string } }[];
  };
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
}


@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    HttpClientModule,
    MatAnchor,

  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})

export class EventComponent implements OnInit {
  private http = inject(HttpClient);

  events: TicketmasterEvent[] = [];
  isLoading = false;
  error: string | null = null;
  locationCity: string = 'Detecting Location...'; // Initial message

  ngOnInit(): void {
    this.getUserLocationAndFetchEvents();
  }

  getUserLocationAndFetchEvents(): void {
    this.isLoading = true;
    this.error = null;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.fetchEventsByCoordinates(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          this.handleLocationError(error);
        },
        {
          enableHighAccuracy: true, // Request more accurate location (may take longer)
          timeout: 5000,           // Timeout if location isn't obtained within 5 seconds
          maximumAge: 60000        // Don't use cached location older than 60 seconds
        }
      );
    } else {
      this.handleLocationError({ message: 'Geolocation is not supported by this browser.' } as GeolocationPositionError);
    }
  }

  handleLocationError(error: GeolocationPositionError): void {
    this.error = `Error getting location: ${error.message}. Falling back to Wexford.`;
    console.error('Location error:', error);
    this.locationCity = 'Wexford (Fallback)';
    this.fetchEvents('Wexford'); // Fallback to Wexford
  }

  /**
   * Fetches events from the Ticketmaster API based on latitude and longitude.
   * @param latitude The latitude of the location.
   * @param longitude The longitude of the location.
   */
  fetchEventsByCoordinates(latitude: number, longitude: number): void {
    const apiKey = environment.ticketmasterKey;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&latlong=${latitude},${longitude}&radius=50&unit=km&sort=date,asc&countryCode=IE`; // Added countryCode

    console.log('Fetching events from coordinates:', url);
    this.locationCity = 'Near Your Location'; // Update location display
    this.isLoading = true;
    this.error = null;

    this.http.get<TicketmasterResponse>(url).pipe(
      catchError((err) => {
        this.error = 'Failed to fetch events near your location.';
        console.error('Error fetching events by coordinates:', err);
        this.isLoading = false;
        return of({ _embedded: { events: [] } } as TicketmasterResponse); // Return an empty events array on error
      })
    ).subscribe({
      next: (response) => {
        this.events = response._embedded?.events || [];
        this.isLoading = false;
        console.log('Events received (coordinates):', this.events);
      },
      complete: () => {
        console.log('Event fetching by coordinates completed.');
      },
    });
  }

  /**
   * Fetches events from the Ticketmaster API for a given city.
   * @param city The name of the city to search for events.
   */
  fetchEvents(city: string): void {
    const apiKey = environment.ticketmasterKey;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&countryCode=IE&sort=date,asc`;

    console.log('Fetching events from city:', url);
    this.locationCity = city;
    this.isLoading = true;
    this.error = null;

    this.http.get<TicketmasterResponse>(url).pipe(
      catchError((err) => {
        this.error = `Failed to fetch events for ${city}.`;
        console.error(`Error fetching events for ${city}:`, err);
        this.isLoading = false;
        return of({ _embedded: { events: [] } } as TicketmasterResponse); // Return empty array on error
      })
    ).subscribe({
      next: (response) => {
        this.events = response._embedded?.events || [];
        this.isLoading = false;
        console.log('Events received (city):', this.events);
      },
      complete: () => {
        console.log('Event fetching by city completed.');
      },
    });
  }

  // Helper function to get the primary image URL safely
  getEventImageUrl(event: TicketmasterEvent): string {
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
