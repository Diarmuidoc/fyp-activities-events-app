import { Routes } from '@angular/router';
import { HomeComponent} from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';

const routeConfig: Routes = [
  { path: '', component: HomeComponent, title: 'Home Page' },
  { path: 'event', component: EventComponent, title: 'Event Page' },
]

export default routeConfig;
