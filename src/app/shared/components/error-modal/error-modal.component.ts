// src/app/shared/components/error-modal/error-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  @Input() message = 'Ocorreu um erro ao salvar!';
  @Input() details = 'Por favor, tente novamente.';
  @Output() retry = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
