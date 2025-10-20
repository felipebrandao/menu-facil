import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css'
})
export class RecipeCardComponent {
  @Input() title: string = '';
  @Input() category: string = '';
  @Input() image: string = '';
  @Input() id: string = '';

  imageError = false;

  onImageError() {
    this.imageError = true;
  }
}
