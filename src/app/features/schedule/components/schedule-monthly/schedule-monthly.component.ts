import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

export interface DaySlot {
  date?: Date;
  label: string;
  short?: string;
  items: RecipeSummary[];
  disabled?: boolean;
  past?: boolean;
}

@Component({
  selector: 'app-schedule-monthly',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, DragDropModule],
  templateUrl: './schedule-monthly.component.html',
  styleUrl: './schedule-monthly.component.css'
})
export class ScheduleMonthlyComponent implements OnChanges {
  @Input() currentDate: Date = new Date();
  @Input() recipes: RecipeSummary[] = [];
  @Input() filterQuery = '';
  @Input() filterCategory = 'Todos';
  @Input() scheduledMap: Record<string, RecipeSummary[]> = {};
  @Input() connectedDropLists: string[] = [];

  @Input() isLoading = false;

  @Output() openDay = new EventEmitter<number>();
  @Output() addToDate = new EventEmitter<{ recipe: RecipeSummary; dateKey: string }>();
  @Output() removeFromDate = new EventEmitter<{ dateKey: string; itemIndex: number }>();
  @Output() openItem = new EventEmitter<{ dateKey: string; itemIndex: number; recipe: RecipeSummary }>();
  @Output() selectDate = new EventEmitter<string>();
  @Output() reorderDate = new EventEmitter<{ dateKey: string; newOrder: RecipeSummary[] }>();
  @Output() recipeDroppedFromList = new EventEmitter<{ recipe: RecipeSummary; dateKey: string }>();

  @Input() selectedDateKey?: string;

  monthDays: DaySlot[] = [];

  private dayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  todayString = new Date().toDateString();

  private startOfToday(): Date {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['currentDate'] ||
      changes['scheduledMap'] ||
      changes['filterQuery'] ||
      changes['filterCategory'] ||
      changes['recipes']
    ) {
      this.buildMonth();
    }
  }

  public dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildMonth() {
    const d = new Date(this.currentDate);
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastOfMonth.getDate();

    const leading = firstOfMonth.getDay();
    const prevMonthLast = new Date(year, month, 0).getDate();

    const today = this.startOfToday();

    const cells: DaySlot[] = [];

    for (let i = leading - 1; i >= 0; i--) {
      const dayNum = prevMonthLast - i;
      const date = new Date(year, month - 1, dayNum);
      cells.push({
        date,
        label: this.dayLabels[date.getDay()],
        short: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        items: [],
        disabled: true
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      cells.push({
        date,
        label: this.dayLabels[date.getDay()],
        short: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`,
        items: []
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay++);
      cells.push({
        date,
        label: this.dayLabels[date.getDay()],
        short: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        items: [],
        disabled: true
      });
    }

    for (const c of cells) {
      if (!c.date) continue;
      const key = this.dateKey(c.date);
      c.items = this.scheduledMap?.[key] ? [...this.scheduledMap[key]] : [];
    }

    for (const c of cells) {
      if (!c.date) continue;

      const cellDate = new Date(c.date);
      cellDate.setHours(0, 0, 0, 0);

      c.past = !c.disabled && cellDate.getTime() < today.getTime();
    }

    this.monthDays = cells;
  }

  emitOpen(dayIndex: number) {
    this.openDay.emit(dayIndex);

    const d: Date | undefined = this.monthDays?.[dayIndex]?.date as Date | undefined;
    if (!d) return;
    if (this.monthDays?.[dayIndex]?.disabled) return;

    this.selectDate.emit(this.dateKey(d));
  }

  emitRemove(dayIndex: number, itemIndex: number, ev?: MouseEvent) {
    ev?.stopPropagation();
    const d: Date | undefined = this.monthDays?.[dayIndex]?.date as Date | undefined;
    if (!d) return;
    const dateKey = this.formatKey(d);
    this.removeFromDate.emit({ dateKey, itemIndex });
  }

  private formatKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  emitOpenItem(dayIndex: number, itemIndex: number) {
    const slot = this.monthDays?.[dayIndex];
    if (!slot?.date) return;
    const key = this.dateKey(slot.date);
    const recipe = slot.items?.[itemIndex];
    if (!recipe) return;
    this.openItem.emit({ dateKey: key, itemIndex, recipe });
  }

  isSelected(day: DaySlot): boolean {
    if (!this.selectedDateKey || !day?.date) return false;
    return this.dateKey(day.date) === this.selectedDateKey;
  }

  dotsCount(items: RecipeSummary[] | null | undefined): number {
    const len = items?.length ?? 0;
    return len > 3 ? 3 : len;
  }

  dotsArray(items: RecipeSummary[] | null | undefined): any[] {
    return Array(this.dotsCount(items));
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

  onDrop(event: CdkDragDrop<RecipeSummary[]>, dateKey: string) {
    if (event.previousContainer !== event.container) {
      const recipe = event.previousContainer.data[event.previousIndex];
      if (recipe) {
        const currentItems = this.scheduledMap[dateKey] || [];
        this.scheduledMap = {
          ...this.scheduledMap,
          [dateKey]: [...currentItems, recipe]
        };
        this.recipeDroppedFromList.emit({ recipe, dateKey });
      }
      return;
    }

    if (event.previousIndex === event.currentIndex) return;

    const items = this.scheduledMap[dateKey];
    if (!items) return;

    const newItems = [...items];
    moveItemInArray(newItems, event.previousIndex, event.currentIndex);

    this.reorderDate.emit({ dateKey, newOrder: newItems });
  }
}
