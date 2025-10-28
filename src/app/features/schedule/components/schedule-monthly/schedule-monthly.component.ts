import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';

export interface DaySlot {
  date?: Date;
  label: string;
  short?: string;
  items: RecipeSummary[];
  disabled?: boolean;
}

@Component({
  selector: 'app-schedule-monthly',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './schedule-monthly.component.html',
  styleUrl: './schedule-monthly.component.css'
})
export class ScheduleMonthlyComponent implements OnChanges {
  @Input() currentDate: Date = new Date();
  @Input() recipes: RecipeSummary[] = [];
  @Input() filterQuery = '';
  @Input() filterCategory = 'Todos';
  @Input() scheduledMap: Record<string, RecipeSummary[]> = {};

  @Output() openDay = new EventEmitter<number>();
  @Output() addToDate = new EventEmitter<{ recipe: RecipeSummary; dateKey: string }>();
  @Output() removeFromDate = new EventEmitter<{ dateKey: string; itemIndex: number }>();
  @Output() openItem = new EventEmitter<{ dateKey: string; itemIndex: number; recipe: RecipeSummary }>();

  monthDays: DaySlot[] = [];

  private dayLabels = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'];

  todayString = new Date().toDateString();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate'] || changes['scheduledMap'] || changes['filterQuery'] || changes['filterCategory'] || changes['recipes']) {
      this.buildMonth();
    }
  }

  private dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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

    const cells: DaySlot[] = [];

    for (let i = leading - 1; i >= 0; i--) {
      const dayNum = prevMonthLast - i;
      const date = new Date(year, month - 1, dayNum);
      cells.push({
        date,
        label: this.dayLabels[date.getDay()],
        short: `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth() + 1).padStart(2,'0')}`,
        items: [],
        disabled: true
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      cells.push({
        date,
        label: this.dayLabels[date.getDay()],
        short: `${String(day).padStart(2,'0')}/${String(month + 1).padStart(2,'0')}`,
        items: []
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay++);
      cells.push({
        date,
        label: this.dayLabels[date.getDay()],
        short: `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth() + 1).padStart(2,'0')}`,
        items: [],
        disabled: true
      });

      for (const c of cells) {
        if (c.date) {
          const key = this.dateKey(c.date);
          c.items = (this.scheduledMap && this.scheduledMap[key]) ? [...this.scheduledMap[key]] : [];
        }
      }
    }

    this.monthDays = cells;
  }

  emitOpen(dayIndex: number) { this.openDay.emit(dayIndex); }

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
}
