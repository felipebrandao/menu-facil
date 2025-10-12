import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css'
})
export class RecipeCardComponent {
  @Input() title!: string;
  @Input() category!: string;
  @Input() image!: string;

  imageError = false;

  onImageError() {
    this.imageError = true;
  }
}
