import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RecipeIngredientsFormComponent} from './components/recipe-ingredients-form/recipe-ingredients-form.component';
import {RecipeService} from '../../../../shared/services/recipe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SuccessModalComponent} from '../../../../shared/components/success-modal/success-modal.component';
import {ErrorModalComponent} from '../../../../shared/components/error-modal/error-modal.component';
import {RecipeInstructionsComponent} from './components/recipe-instructions/recipe-instructions.component';
import {RecipeImagesComponent} from './components/recipe-images/recipe-images.component';
import { NewCategoryModalComponent } from '../../../../shared/components/new-category-modal/new-category-modal.component';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecipeIngredientsFormComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    RecipeInstructionsComponent,
    RecipeImagesComponent,
    NewCategoryModalComponent
  ],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.css'
})
export class RecipeComponent implements OnInit {
  form: FormGroup;
  categories = ['Café da Manhã', 'Almoço', 'Janta'];
  units = ['g', 'ml', 'unidade', 'xícara'];
  mainImage?: File;
  galleryImages: File[] = [];
  showSuccessModal = false;
  lastRecipeId: string | null = null;
  ingredientError: string = '';
  showErrorModal = false;
  showCategoryModal = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      recipeName: ['', Validators.required],
      instructions: this.fb.array([this.fb.control('')]),
      category: ['', Validators.required],
      ingredients: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.recipeService.getRecipeById(id).subscribe(recipe => {
        if (!recipe) return;
        this.lastRecipeId = id;
        this.form.patchValue({
          recipeName: recipe.name,
          category: recipe.category,
          ingredients: recipe.ingredients || []
        });

        const instArray = this.form.get('instructions') as FormArray;
        instArray.clear();
        (recipe.instructions || []).forEach((s: string) => instArray.push(this.fb.control(s)));
      });
    }
  }

  get recipeName() { return this.form.get('recipeName'); }
  get category() { return this.form.get('category'); }
  get ingredients() { return this.form.get('ingredients'); }

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

    const recipePayload = {
      name: this.form.value.recipeName,
      instructions: instructions,
      category: this.form.value.category,
      ingredients: this.form.value.ingredients
      // mainImage: 'https://cdn.example.com/placeholder.jpg',
      // gallery: []
    };

    const finalizeSuccess = (recipeId: string) => {
      this.lastRecipeId = recipeId;
      this.showSuccessModal = true;
    };

    if (this.lastRecipeId) {
      this.recipeService.updateRecipe(this.lastRecipeId, recipePayload as any).subscribe({
        next: () => finalizeSuccess(this.lastRecipeId as string),
        error: () => (this.showErrorModal = true)
      });
    } else {
      this.recipeService.createRecipe(recipePayload as any).subscribe({
        next: res => finalizeSuccess(res.id),
        error: () => (this.showErrorModal = true)
      });
    }
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

  openCategoryModal() {
    this.showCategoryModal = true;
  }

  onCategorySaved(categoryName: string) {
    if (categoryName && !this.categories.includes(categoryName)) {
      this.categories = [...this.categories, categoryName];
      this.form.patchValue({ category: categoryName });
    }
    this.showCategoryModal = false;
  }

  onCategoryClosed() {
    this.showCategoryModal = false;
  }

}
