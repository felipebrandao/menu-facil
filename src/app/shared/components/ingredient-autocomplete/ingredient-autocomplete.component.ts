import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IngredientService} from '../../services/ingredient.service';
import {IngredientSuggestion} from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredient-autocomplete.component.html',
  styleUrl: './ingredient-autocomplete.component.css'
})
export class IngredientAutocompleteComponent {
  @Input() placeholder = 'Buscar ingrediente...';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() selected = new EventEmitter<{ id?: string, name: string }>();
  @Output() register = new EventEmitter<string>();

  suggestions: IngredientSuggestion[] = [];
  showSuggestions = false;

  constructor(private ingredientService: IngredientService) {}

  onSearchChange() {
    this.valueChange.emit(this.value);
    const q = this.value.trim();
    if (q.length < 2) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.ingredientService.search(q, 3).subscribe({
      next: res => {
        this.suggestions = res;
        this.showSuggestions = true;
      },
      error: () => {
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  select(ingredientSuggestion: IngredientSuggestion) {
    this.selected.emit(ingredientSuggestion);
    this.value = ingredientSuggestion.name;
    this.valueChange.emit(this.value);
    this.showSuggestions = false;
  }

  registerNew() {
    this.register.emit(this.value);
    this.showSuggestions = false;
  }

  onBlur() {
    setTimeout(() => this.showSuggestions = false, 200);
  }
}
