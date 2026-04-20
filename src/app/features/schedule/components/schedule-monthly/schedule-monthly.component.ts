import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { getCategoryColorScheme } from '../../utils/category-color.util';

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

  getCategoryBarClass(category: string): string {
    return getCategoryColorScheme(category).bar;
  }

  getCategoryLabelClass(category: string): string {
    return getCategoryColorScheme(category).label;
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
