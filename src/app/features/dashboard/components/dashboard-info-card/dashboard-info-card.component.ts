import { Component, Input } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-dashboard-info-card',
  standalone: true,
  templateUrl: './dashboard-info-card.component.html',
  imports: [
    RouterLink,
    NgClass
  ],
  styleUrl: './dashboard-info-card.component.css'
})
export class DashboardInfoCardComponent {
  @Input() cardColor!: 'green' | 'blue' | 'yellow';
  @Input() tagText!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() linkUrl!: string;
  @Input() linkText!: string;
  @Input() linkIcon!: string;
}
