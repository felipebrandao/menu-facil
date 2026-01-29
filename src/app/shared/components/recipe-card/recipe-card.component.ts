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
  @Input() isFavorite?: boolean = false;

  @Input() author?: string = 'Vivian';

  @Input() rating?: number = 4.5;
  @Input() reviewsCount?: number = 10;

  imageError = false;
  avatarError = false;

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

  private readonly categoryColorPalette = [
    { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-200' },
    { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200' },
    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-200' },
    { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-200' },
    { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-200' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-200' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-800 dark:text-cyan-200' },
  ] as const;

  getCategoryBadgeClasses(category: string): string {
    const color = this.getCategoryColor(category);
    return `${color.bg} ${color.text}`;
  }

  private getCategoryColor(category: string): { bg: string; text: string } {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
    }
    return this.categoryColorPalette[hash % this.categoryColorPalette.length];
  }
}
