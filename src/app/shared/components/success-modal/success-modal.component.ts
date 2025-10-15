import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.css'
})
export class SuccessModalComponent {
  @Input() title = 'Receita Salva com Sucesso!';
  @Output() view = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
}
