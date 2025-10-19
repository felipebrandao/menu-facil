import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-category-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './new-category-modal.component.html',
  styleUrl: './new-category-modal.component.css'
})
export class NewCategoryModalComponent {
  @Output() saved = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  name: string = '';

  save() {
    const trimmed = (this.name || '').trim();
    if (trimmed) {
      this.saved.emit(trimmed);
    }
  }

  close() {
    this.closed.emit();
  }
}
