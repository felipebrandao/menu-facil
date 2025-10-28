import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent {
  @Input() title: string = '';
  @Input() category: string = '';
  @Input() image: string = '';
  @Input() id: string = '';

  @Input() author?: string = 'Vivian';

  @Input() rating?: number = 4.5;
  @Input() reviewsCount?: number = 10;

  imageError = false;
  avatarError = false;
  isFavorite = false;

  @Output() favoriteToggled = new EventEmitter<{ id: string; favorite: boolean }>();
  @Output() addToSchedule = new EventEmitter<string>();
  @Output() addToShoppingList = new EventEmitter<string>();

  onImageError() {
    this.imageError = true;
  }

  toggleFavorite(event?: Event) {
    if (event) event.stopPropagation();
    this.isFavorite = !this.isFavorite;
    if (this.id) this.favoriteToggled.emit({ id: this.id, favorite: this.isFavorite });
  }

  onAddToSchedule(event?: Event) {
    if (event) event.stopPropagation();
    if (this.id) this.addToSchedule.emit(this.id);
  }

  onAddToShoppingList(event?: Event) {
    if (event) event.stopPropagation();
    if (this.id) this.addToShoppingList.emit(this.id);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }
}
