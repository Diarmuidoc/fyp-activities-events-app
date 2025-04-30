import {AfterViewInit, Component, inject, Inject, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {AuthenticationService} from './services/authentication.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnInit {
  authService = inject(AuthenticationService)
  map!: google.maps.Map;
  userDisplayName: string = 'User';

  ngOnInit(): void{
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!
        })
      } else{
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    })
  }

  logout(): void {
    this.authService.logout();
  }

  constructor() {
    this.authService.user$.subscribe(user => {
      this.userDisplayName = user?.displayName || 'User';
    });
  }

  ngAfterViewInit() {
    this.loadGoogleMaps().then(() => {
      this.initMap();
    }).catch(err => console.error('Google Maps API not available:', err));
  }

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve(); // Google Maps already loaded
      } else {
        const script = document.getElementById('google-maps-script');
        if (script) {
          script.addEventListener('load', () => resolve());
          script.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
        } else {
          reject(new Error('Google Maps script not found'));
        }
      }
    });
  }

  initMap() {
    const mapElement = document.getElementById('map') as HTMLElement;
    if (!mapElement) {
      console.error('Map element not found!');
      return;
    }

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 52.3369, lng: -6.4633 },
      zoom: 10
    });
  }


  getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            reject(null);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        reject(null);
      }
    });
  }
}


