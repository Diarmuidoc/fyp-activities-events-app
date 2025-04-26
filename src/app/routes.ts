import { Routes } from '@angular/router';
import { HomeComponent} from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';
import {UserSignUpComponent} from './pages/user-sign-up/user-sign-up.component';
import {UserLoginComponent} from './pages/user-login/user-login.component';
import {ActivityComponent} from './pages/activity/activity.component';
import {ActivityDetailsComponent} from './pages/activity-details/activity-details.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { authGuard } from './auth.guard';

const routeConfig: Routes = [
  { path: '', component: HomeComponent, title: 'Home Page' },
  { path: 'event', component: EventComponent, title: 'Event Page' },
  { path: 'user-sign-up', component: UserSignUpComponent, title: 'Sign Up Page' },
  { path: 'user-login', component: UserLoginComponent, title: 'Login Page' },
  { path: 'activity', component: ActivityComponent, title: 'Activity Page' },
  { path: 'activity/:placeId', component: ActivityDetailsComponent, title: 'Activity Details Page' },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
]

export default routeConfig;
