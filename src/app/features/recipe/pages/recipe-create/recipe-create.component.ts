import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FilePreviewPipe} from '../../../../shared/pipes/file-preview.pipe';
import { IngredientAutocompleteComponent } from '../../../../shared/components/ingredient-autocomplete/ingredient-autocomplete.component';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [CommonModule, FormsModule, FilePreviewPipe, IngredientAutocompleteComponent],
  templateUrl: './recipe-create.component.html',
  styleUrl: './recipe-create.component.css'
})
export class RecipeCreateComponent {
  recipeName = '';
  instructions = '';
  category = '';
  categories = ['Café da Manhã', 'Almoço', 'Janta'];
  ingredient: Ingredient = { name: '', quantity: 1, unit: 'g' };
  ingredients: Ingredient[] = [];
  units = ['g', 'ml', 'unidade', 'xícara'];
  mainImage?: File;
  galleryImages: File[] = [];

  addIngredient() {
    if (this.ingredient.name && this.ingredient.quantity) {
      this.ingredients.push({ ...this.ingredient });
      this.ingredient = { name: '', quantity: 1, unit: 'g' };
    }
  }

  removeIngredient(index: number) {
    this.ingredients.splice(index, 1);
  }

  onMainImageChange(event: any) {
    this.mainImage = event.target.files[0];
  }

  onGalleryImagesChange(event: any) {
    this.galleryImages = Array.from(event.target.files);
  }

  submit() {
    // Lógica para enviar o formulário
  }

  removeGalleryImage(i: number) {

  }

  openNewIngredientModal() {
    // Lógica para abrir o modal de cadastro de ingrediente
  }
}
