import { Component, OnInit, inject } from '@angular/core';
import { Auth, User, signOut, authState } from '@angular/fire/auth';
import {Router, RouterLink} from '@angular/router';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import {SavedActivity, UserListService} from '../../services/user-list.service';
import {AppCheck} from '@angular/fire/app-check';


// @Component({
//   selector: 'app-user-profile',
//   standalone: true,
//   imports: [CommonModule, RouterLink],
//   templateUrl: './user-profile.component.html',
//   styleUrls: ['./user-profile.component.css']
// })
// export class UserProfileComponent implements OnInit {
//   private auth: Auth = inject(Auth);
//   private router: Router = inject(Router);
//   private userListService = inject(UserListService);
//   private appCheckService: AppCheck = inject(AppCheck); // Inject AppCheck service
//
//   user$: Observable<User | null> = authState(this.auth);
//   savedActivities$: Observable<SavedActivity[]>;
//
//   isLoading: boolean = true;
//   isLoadingList: boolean = true;
//
//   constructor() {
//     this.savedActivities$ = this.userListService.getSavedActivities();
//   }
//
//   async ngOnInit(): Promise<void> {
//     this.savedActivities$.subscribe({
//       next: (list) => {
//         console.log("Loaded saved activities:", list);
//         this.isLoadingList = false;
//       },
//       error: (err) => {
//         console.error("Error loading saved activities:", err);
//         this.isLoadingList = false;
//       }
//     });
//
//     this.user$.subscribe(user => {
//       this.isLoading = false;
//     });
//
//     // Debugging: Get App Check token
//     try {
//       const appCheck = await appCheckInstance(this.appCheckService); // Get the instance
//       const token = await appCheck.getToken();
//       console.log("App Check Token:", token?.token); // Access the token property
//     } catch (error) {
//       console.error("Error getting App Check token:", error);
//     }
//   }


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
    this.savedActivities$.subscribe({
      next: (list) => {
        console.log("Loaded saved activities:", list);
        this.isLoadingList = false;
      },
      error: (err) => {
        console.error("Error loading saved activities:", err);
        this.isLoadingList = false;
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
