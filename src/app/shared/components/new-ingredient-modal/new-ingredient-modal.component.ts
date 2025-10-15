import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IngredientService} from '../../services/ingredient.service';
import { Ingredient } from '../../models/ingredient.model';


@Component({
  selector: 'app-new-ingredient-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-ingredient-modal.component.html',
  styleUrl: './new-ingredient-modal.component.css'
})
export class NewIngredientModalComponent {
  @Input() name: string = '';
  @Output() saved = new EventEmitter<{ id?: string; name: string }>();
  @Output() closed = new EventEmitter<void>();

  unit = 'g';
  category = '';

  constructor(private ingredientService: IngredientService) {}

  submit() {
    if (this.name.trim() && this.unit) {
      const ingredient: Ingredient = {
        name: this.name.trim(),
        unit: this.unit,
        category: this.category
      };
      this.ingredientService.create(ingredient).subscribe(created => {
        this.saved.emit({ id: created.id, name: created.name });
        this.name = '';
        this.unit = 'g';
        this.category = '';
      });
    }
  }
  close() {
    this.closed.emit();
  }
}
