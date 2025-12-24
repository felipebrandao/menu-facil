import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html'
})
export class SkeletonComponent {
  @Input() rows = 1;
  @Input() widthClass = 'w-full';
  @Input() heightClass = 'h-6';
  @Input() rounded = true;
  @Input() gap = 12;
  @Input() animated = true;
  @Input() baseBg = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';
  @Input() randomWidth = false;

  get rowsArray() {
    return Array.from({length: Math.max(1, Math.floor(this.rows))});
  }

  getWidthClass(index: number): string {
    if (!this.randomWidth) return this.widthClass;

    const widths = ['w-full', 'w-11/12', 'w-5/6', 'w-3/4'];
    return widths[index % widths.length];
  }
}
