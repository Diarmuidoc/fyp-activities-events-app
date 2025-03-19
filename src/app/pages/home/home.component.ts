import {Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import {GoogleMap} from '@angular/google-maps'


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, GoogleMap],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})

export class HomeComponent implements OnInit {
  title = 'Tourism Events and Activities';
  zoom = 12;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
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
