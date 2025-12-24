import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.css'
})
export class SuccessModalComponent {
  @Input() title = 'Operação realizada com sucesso!';
  @Input() message = '';
  @Input() buttonText = 'OK';
  @Output() close = new EventEmitter<void>();
}
