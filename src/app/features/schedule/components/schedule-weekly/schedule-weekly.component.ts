import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

export interface DaySlot {
  date: Date;
  label: string;
  short: string;
  items: RecipeSummary[];
}

@Component({
  selector: 'app-schedule-weekly',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonComponent,
    DragDropModule
  ],
  templateUrl: './schedule-weekly.component.html',
  styleUrl: './schedule-weekly.component.css'
})
export class ScheduleWeeklyComponent {

  @Input() week: DaySlot[] = [];
  @Input() recipes: RecipeSummary[] = [];
  @Input() filterQuery = '';
  @Input() filterCategory = 'Todos';
  @Input() connectedDropLists: string[] = [];

  @Input() isLoading = false;

  @Output() openPanel = new EventEmitter<number>();
  @Output() addToDay = new EventEmitter<{ recipe: RecipeSummary; dayIndex: number }>();
  @Output() removeFromDay = new EventEmitter<{ dayIndex: number; itemIndex: number }>();
  @Output() openItem = new EventEmitter<{ dateKey: string; itemIndex: number; recipe: RecipeSummary }>();
  @Output() reorderDay = new EventEmitter<{ dayIndex: number; newOrder: RecipeSummary[] }>();
  @Output() recipeDroppedFromList = new EventEmitter<{ recipe: RecipeSummary; dayIndex: number }>();

  todayString = new Date().toDateString();

  isPastDay(d: Date): boolean {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day.getTime() < today.getTime();
  }

  emitOpen(dayIndex: number) { this.openPanel.emit(dayIndex); }
  emitRemove(dayIndex: number, itemIndex: number) { this.removeFromDay.emit({ dayIndex, itemIndex }); }

  emitOpenItem(dayIndex: number, itemIndex: number) {
    const day = this.week?.[dayIndex];
    if (!day?.date) return;
    const dateKey = this.formatKey(day.date);
    const recipe = day.items?.[itemIndex];
    if (!recipe) return;
    this.openItem.emit({ dateKey, itemIndex, recipe });
  }

  onDrop(event: CdkDragDrop<RecipeSummary[]>, dayIndex: number) {
    const day = this.week[dayIndex];
    if (!day) return;

    if (event.previousContainer !== event.container) {
      const recipe = event.previousContainer.data[event.previousIndex];
      if (recipe) {
        day.items = [...day.items, recipe];
        this.recipeDroppedFromList.emit({ recipe, dayIndex });
      }
      return;
    }

    if (event.previousIndex === event.currentIndex) return;

    const newItems = [...day.items];
    moveItemInArray(newItems, event.previousIndex, event.currentIndex);

    this.reorderDay.emit({ dayIndex, newOrder: newItems });
  }

  private formatKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private readonly categoryColorPalette = [
    { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800/50', hover: 'hover:bg-orange-200 dark:hover:bg-orange-900/60' },
    { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-800/50', hover: 'hover:bg-red-200 dark:hover:bg-red-900/60' },
    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800/50', hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/60' },
    { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800/50', hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/60' },
    { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-200 dark:border-pink-800/50', hover: 'hover:bg-pink-200 dark:hover:bg-pink-900/60' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-800/50', hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/60' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-200', border: 'border-teal-200 dark:border-teal-800/50', hover: 'hover:bg-teal-200 dark:hover:bg-teal-900/60' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-200 dark:border-emerald-800/50', hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/60' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-800 dark:text-cyan-200', border: 'border-cyan-200 dark:border-cyan-800/50', hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/60' },
  ] as const;

  getCategoryColor(category: string): { bg: string; text: string; border: string; hover: string } {
    const normalized = (category || '').trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
    }
    return this.categoryColorPalette[hash % this.categoryColorPalette.length];
  }

}
