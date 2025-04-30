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
    this.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/profile']);
      } else {
        this.router.navigate(['/user-login']);
      }
    })
  }
}


