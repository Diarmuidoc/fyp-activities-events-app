import {Component, inject, NgModule, OnInit} from '@angular/core';
import {Router, RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import {GoogleMap} from '@angular/google-maps'
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {Auth, authState, User} from '@angular/fire/auth';
import {Observable} from 'rxjs';

//
// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [RouterModule, GoogleMap],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.css',
// })

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterLink, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'Tourism Events and Activities';
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  user$: Observable<User | null> = authState(this.auth);


  navigateToProfile(): void {
    console.log('User object working');
    this.user$.subscribe(user => {
      console.log('User object:', user);
      if (user) {
        console.log('Navigating to /profile'); // Add this line
        this.router.navigate(['/profile']);
        console.log('Navigation to /profile attempted'); // Add this line
      } else {
        console.log('Navigating to /login'); // Add this line
        this.router.navigate(['/login']);
        console.log('Navigation to /login attempted'); // Add this line
      }
    })
  }
}

// export class HomeComponent implements OnInit {
//   title = 'Tourism Events and Activities';
//   zoom = 12;
//   center: google.maps.LatLngLiteral = { lat: 52.3369, lng: -6.4633 };
//   options: google.maps.MapOptions = {
//       mapTypeId: 'roadmap',
//       zoomControl: true,
//       scrollwheel: true,
//   }
//
//   ngOnInit() {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           this.center = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           };
//         },
//         (error) => {
//           console.error("Error getting location", error);
//         }
//       );
//     } else {
//       console.error("Geolocation not supported by this browser.");
//     }
//   }
//   }
