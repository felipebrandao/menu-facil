import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';

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
    CommonModule
  ],
  templateUrl: './schedule-weekly.component.html',
  styleUrl: './schedule-weekly.component.css'
})
export class ScheduleWeeklyComponent {

  @Input() week: DaySlot[] = [];
  @Input() recipes: RecipeSummary[] = [];
  @Input() filterQuery = '';
  @Input() filterCategory = 'Todos';

  @Output() openPanel = new EventEmitter<number>();
  @Output() addToDay = new EventEmitter<{ recipe: RecipeSummary; dayIndex: number }>();
  @Output() removeFromDay = new EventEmitter<{ dayIndex: number; itemIndex: number }>();
  @Output() openItem = new EventEmitter<{ dateKey: string; itemIndex: number; recipe: RecipeSummary }>();

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

  private formatKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

}
