import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent {
  events = [
    { id:1, title: 'Event 1', image: 'https://via.placeholder.com/300', description: 'Description for event 1' },
    { id:2, title: 'Event 2', image: 'https://via.placeholder.com/300', description: 'Description for event 2' },
    { id:3, title: 'Event 3', image: 'https://via.placeholder.com/300', description: 'Description for event 3' }
  ];
}
