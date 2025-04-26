import { Component, OnInit, inject } from '@angular/core';
import { Auth, User, signOut, authState } from '@angular/fire/auth'; // Import necessary auth functions/types
import {Router, RouterLink} from '@angular/router';
import { Observable, of } from 'rxjs'; // Import Observable and of
import { CommonModule } from '@angular/common';
import {SavedActivity, UserListService} from '../../services/user-list.service'; // Import CommonModule for standalone

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink], // Needed for async pipe, ngIf
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private userListService = inject(UserListService);

  // Use authState for reactive user data
  user$: Observable<User | null> = authState(this.auth);
  savedActivities$: Observable<SavedActivity[]>;

  isLoading: boolean = true;
  isLoadingList: boolean = true;

  constructor() {
    this.savedActivities$ = this.userListService.getSavedActivities();
  }

  ngOnInit(): void {
    // Subscribe to list to handle loading state (optional)
    this.savedActivities$.subscribe({
      next: (list) => {
        console.log("Loaded saved activities:", list);
        this.isLoadingList = false;
      },
      error: (err) => {
        console.error("Error loading saved activities:", err);
        this.isLoadingList = false;
        // Maybe set an error message
      }
    });

    // Existing user loading logic
    this.user$.subscribe(user => {
      this.isLoading = false;
    });
  }

  async removeSavedActivity(placeId: string): Promise<void> {
    if (!placeId) return;

    const confirmation = confirm("Are you sure you want to remove this activity from your list?");
    if (!confirmation) return;

    try {
      await this.userListService.removeActivity(placeId);
      alert("Activity removed successfully.");
      // The list will update automatically because savedActivities$ is an observable
    } catch (error) {
      console.error('Error removing activity:', error);
      alert("Failed to remove activity. Please try again.");
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('User logged out successfully.');
      // Redirect to home or login page after logout
      this.router.navigate(['/']); // Navigate to home page
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle logout error (e.g., display a message)
    }
  }
}
