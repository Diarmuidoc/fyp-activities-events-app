import {Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import {GoogleMap} from '@angular/google-maps'


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [RouterModule, GoogleMap],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})

export class MapComponent implements OnInit {
  title = 'Tourism Events and Activities';
  zoom = 12;
  center: google.maps.LatLngLiteral = { lat: 52.3369, lng: -6.4633 };
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
  }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
    }
  }
}
