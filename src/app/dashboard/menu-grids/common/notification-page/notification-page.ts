import { Component, Input } from '@angular/core';

@Component({
  selector: 'notification-page',
  standalone: true,
  imports: [],
  templateUrl: './notification-page.html',
  styleUrl: './notification-page.scss'
})
export class NotificationPage {
  @Input() enableNote: boolean;
}
