import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { getCategoryColorScheme } from '../../utils/category-color.util';

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

  getCategoryBarClass(category: string): string {
    return getCategoryColorScheme(category).bar;
  }

  getCategoryLabelClass(category: string): string {
    return getCategoryColorScheme(category).label;
  }

}
