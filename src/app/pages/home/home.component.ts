import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {Auth, authState, User} from '@angular/fire/auth';
import {Observable} from 'rxjs';



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
        console.log('Navigating to /profile');
        this.router.navigate(['/profile']);
        console.log('Navigation to /profile attempted');
      } else {
        console.log('Navigating to /login');
        this.router.navigate(['/login']);
        console.log('Navigation to /login attempted');
      }
    })
  }
}


