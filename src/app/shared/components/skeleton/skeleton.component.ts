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
  @Input() baseBg = 'bg-gray-200 dark:bg-gray-700';

  get rowsArray() {
    return Array.from({length: Math.max(1, Math.floor(this.rows))});
  }
}
