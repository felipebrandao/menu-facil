import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RecipeIngredientsFormComponent} from './components/recipe-ingredients-form/recipe-ingredients-form.component';
import {RecipeService} from '../../../../shared/services/recipe.service';
import {Router} from '@angular/router';
import {SuccessModalComponent} from '../../../../shared/components/success-modal/success-modal.component';
import {ErrorModalComponent} from '../../../../shared/components/error-modal/error-modal.component';
import {RecipeInstructionsComponent} from './components/recipe-instructions/recipe-instructions.component';
import { RecipeImagesComponent } from './components/recipe-images/recipe-images.component';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecipeIngredientsFormComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    RecipeInstructionsComponent,
    RecipeImagesComponent
  ],
  templateUrl: './recipe-create.component.html',
  styleUrl: './recipe-create.component.css'
})
export class RecipeCreateComponent {
  form: FormGroup;
  categories = ['Café da Manhã', 'Almoço', 'Janta'];
  units = ['g', 'ml', 'unidade', 'xícara'];
  mainImage?: File;
  galleryImages: File[] = [];
  showSuccessModal = false;
  lastRecipeId: string | null = null;
  ingredientError: string = '';
  showErrorModal = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router
  ) {
    this.form = this.fb.group({
      recipeName: ['', Validators.required],
      instructions: this.fb.array([this.fb.control('')]),
      category: ['', Validators.required],
      ingredients: [[], Validators.required]
    });
  }

  get recipeName() { return this.form.get('recipeName'); }
  get category() { return this.form.get('category'); }
  get ingredients() { return this.form.get('ingredients'); }

  onMainImageChange(event: any) {
    this.mainImage = event.target.files[0];
  }

  onGalleryImagesChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.galleryImages = [...this.galleryImages, ...files];
    event.target.value = '';
  }

  onIngredientsChange(ingredients: any) {
    this.form.get('ingredients')?.setValue(ingredients);
    this.form.get('ingredients')?.markAsDirty();
    this.form.get('ingredients')?.updateValueAndValidity();
    if (ingredients && ingredients.length > 0) {
      this.ingredientError = '';
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (!this.form.value.ingredients || this.form.value.ingredients.length === 0) {
        this.ingredientError = 'Adicione pelo menos um ingrediente.';
      }
      return;
    }

    const instructions = (this.form.value.instructions || [])
      .map((s: string) => (s || '').trim())
      .filter((s: string) => s.length > 0);

    const recipe = {
      name: this.form.value.recipeName,
      instructions: instructions,
      category: this.form.value.category,
      ingredients: this.form.value.ingredients,
      mainImage: 'https://cdn.example.com/placeholder.jpg',
      gallery: []
    };

    this.recipeService.createRecipe(recipe).subscribe({
      next: res => {
        this.lastRecipeId = res.id;
        this.showSuccessModal = true;
      },
      error: err => {
        this.showErrorModal = true;
      }
    });
  }

  removeGalleryImage(i: number) {
    this.galleryImages.splice(i, 1);
  }

  onViewRecipe() {
    if (this.lastRecipeId) {
      this.router.navigate(['/receitas', this.lastRecipeId]);
    }
  }

  onBackToList() {
    this.router.navigate(['/receitas']);
  }

  onRetry() {
    this.showErrorModal = false;
    this.submit();
  }

  onCancel() {
    this.showErrorModal = false;
  }

  get instructionsArray(): FormArray {
    return this.form.get('instructions') as FormArray;
  }

}
