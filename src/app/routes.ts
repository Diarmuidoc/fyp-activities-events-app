import { Routes } from '@angular/router';
import { HomeComponent} from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import {UserSignUpComponent} from './pages/user-sign-up/user-sign-up.component';
import {UserLoginComponent} from './pages/user-login/user-login.component';
import {ActivityComponent} from './pages/activity/activity.component';
import {ActivityDetailsComponent} from './pages/activity-details/activity-details.component';

const routeConfig: Routes = [
  { path: '', component: HomeComponent, title: 'Home Page' },
  { path: 'event', component: EventComponent, title: 'Event Page' },
  { path: 'event-details/:id', component: EventDetailsComponent, title: 'Event Details' },
  { path: 'user-sign-up', component: UserSignUpComponent, title: 'Sign Up Page' },
  { path: 'user-login', component: UserLoginComponent, title: 'Login Page' },
  { path: 'activity', component: ActivityComponent, title: 'Activity Page' },
  { path: 'activity/:placeId', component: ActivityDetailsComponent, title: 'Activity Details Page' },
]

export default routeConfig;
