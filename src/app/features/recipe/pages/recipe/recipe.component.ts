import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { RecipeIngredientsFormComponent } from './components/recipe-ingredients-form/recipe-ingredients-form.component';
import {RecipeService} from '../../../../shared/services/recipe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SuccessModalComponent} from '../../../../shared/components/success-modal/success-modal.component';
import {ErrorModalComponent} from '../../../../shared/components/error-modal/error-modal.component';
import {RecipeInstructionsComponent} from './components/recipe-instructions/recipe-instructions.component';
import {RecipeImagesComponent} from './components/recipe-images/recipe-images.component';
import {NewCategoryModalComponent} from '../../../../shared/components/new-category-modal/new-category-modal.component';
import {RecipeCategory} from '../../../../shared/models/recipe.model';
import {RecipeCategoryService} from '../../../../shared/services/recipe-category.service';
import {SkeletonComponent} from '../../../../shared/components/skeleton/skeleton.component';
import {NewIngredientModalComponent} from '../../../../shared/components/new-ingredient-modal/new-ingredient-modal.component';

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
    NewCategoryModalComponent,
    SkeletonComponent,
    NewIngredientModalComponent
  ],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {
  form: FormGroup;
  categories: RecipeCategory[] = [];
  mainImage?: File;
  galleryImages: File[] = [];
  showSuccessModal = false;
  lastRecipeId: string | null = null;
  ingredientError: string = '';
  showErrorModal = false;
  showCategoryModal = false;
  loading = false;
  showIngredientModal = false;
  ingredientModalFormData: any = null;

  isSaving = false;

  @ViewChild(RecipeIngredientsFormComponent)
  ingredientsFormComponent!: RecipeIngredientsFormComponent;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute,
    private recipeCategoryService: RecipeCategoryService
  ) {
    this.form = this.fb.group({
      recipeName: ['', Validators.required],
      instructions: this.fb.array([]),
      category: ['', Validators.required],
      ingredients: [[], Validators.required],
      totalTime: [null, [Validators.min(0)]],
      highlighted: [false]
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.recipeService.getRecipeById(id).subscribe({
        next: (recipe) => {
          if (!recipe) return;
          this.lastRecipeId = id;

          const convertedIngredients = recipe.ingredients.map(ing => ({
            id: ing.ingredientId,
            name: ing.ingredientName,
            unit: ing.unitUsedId,
            unitName: ing.unitUsedName,
            abbreviation: ing.unitUsedAbbreviation,
            quantity: ing.quantity
          }));

          this.form.patchValue({
            recipeName: recipe.name,
            category: recipe.category.id,
            ingredients: convertedIngredients,
            totalTime: recipe.totalTime,
            highlighted: recipe.highlighted || false
          });

          const instArray = this.form.get('instructions') as FormArray;
          instArray.clear();
          (recipe.instructions || []).forEach((s: string) => instArray.push(this.fb.control(s)));

          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  private loadCategories() {
    this.recipeCategoryService.getAll().subscribe({
      next: (list) => {
        this.categories = list || [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  get recipeName() { return this.form.get('recipeName'); }
  get category() { return this.form.get('category'); }
  get ingredients() { return this.form.get('ingredients'); }
  get totalTime() { return this.form.get('totalTime'); }
  get highlighted() { return this.form.get('highlighted'); }

  onIngredientsChange(ingredients: any) {
    this.form.get('ingredients')?.setValue(ingredients);
    this.form.get('ingredients')?.markAsDirty();
    this.form.get('ingredients')?.updateValueAndValidity();
    if (ingredients && ingredients.length > 0) {
      this.ingredientError = '';
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (!this.form.value.ingredients || this.form.value.ingredients.length === 0) {
        this.ingredientError = 'Adicione pelo menos um ingrediente.';
      }
      return;
    }

    this.isSaving = true;

    const instructions = (this.form.value.instructions || [])
      .map((s: string) => (s || '').trim())
      .filter((s: string) => s.length > 0);

    const recipePayload = {
      name: this.form.value.recipeName,
      categoryId: this.form.value.category,
      ingredients: this.form.value.ingredients.map((i: any) => ({
        ingredientId: i.id,
        unitUsedId: i.unit,
        quantity: i.quantity
      })),
      instructions: instructions,
      mainImage: null,
      gallery: [],
      totalTime: this.form.value.totalTime,
      highlighted: this.form.value.highlighted
    };

    const finalizeSuccess = (recipeId: string) => {
      this.lastRecipeId = recipeId;
      this.showSuccessModal = true;
      this.isSaving = false;
    };

    const handleError = () => {
      this.showErrorModal = true;
      this.isSaving = false;
    };

    if (this.lastRecipeId) {
      this.recipeService.updateRecipe(this.lastRecipeId, recipePayload).subscribe({
        next: () => {
          this.uploadImages(this.lastRecipeId!, finalizeSuccess, handleError);
        },
        error: handleError
      });
      return;
    }

    this.recipeService.createRecipe(recipePayload).subscribe({
      next: (res) => {
        const id = res.id;
        this.uploadImages(id, finalizeSuccess, handleError);
      },
      error: handleError
    });
  }

  uploadImages(
    recipeId: string,
    onSuccess: (id: string) => void,
    onError: () => void
  ) {
    if (!this.mainImage && (!this.galleryImages || this.galleryImages.length === 0)) {
      onSuccess(recipeId);
      return;
    }

    const uploads: Promise<any>[] = [];

    if (this.mainImage) {
      uploads.push(
        this.recipeService.uploadMainImage(recipeId, this.mainImage).toPromise()
      );
    }

    if (this.galleryImages && this.galleryImages.length > 0) {
      uploads.push(
        this.recipeService.uploadGalleryImages(recipeId, this.galleryImages).toPromise()
      );
    }

    Promise.all(uploads)
      .then(() => onSuccess(recipeId))
      .catch(() => onError());
  }

  onViewRecipe() {
    if (this.lastRecipeId) {
      this.router.navigate(['/recipes', this.lastRecipeId]);
    }
  }

  onBackToList() {
    this.router.navigate(['/my-recipes']);
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
    if (!categoryName) {
      this.showCategoryModal = false;
      return;
    }
    this.recipeCategoryService.create(categoryName).subscribe({
      next: (created) => {
        this.categories = [created, ...this.categories];
        this.form.patchValue({ category: created });
        this.showCategoryModal = false;
      },
      error: () => {
        this.showCategoryModal = false;
      }
    });
  }

  onCategoryClosed() {
    this.showCategoryModal = false;
  }

  toggleFavorite(): void {
    const currentValue = this.highlighted?.value;
    this.highlighted?.setValue(!currentValue);
    this.highlighted?.markAsDirty();
  }

  onSuccessModalClose() {
    this.showSuccessModal = false;
    this.router.navigate(['/my-recipes']);
  }

  onOpenIngredientModal(event: any) {
    if (event.mode === 'edit') {
      this.ingredientModalFormData = event.data;
    } else {
      this.ingredientModalFormData = {
        id: undefined,
        name: event.name
      };
    }
    this.showIngredientModal = true;
  }

  onIngredientModalClosed() {
    this.showIngredientModal = false;
    this.ingredientModalFormData = null;
  }

  onIngredientModalSaved(savedIngredient: any) {
    this.showIngredientModal = false;
    this.ingredientModalFormData = null;

    this.ingredientsFormComponent?.onIngredientModalSaved(savedIngredient);
  }

  get isBlocking(): boolean {
    return this.loading || this.isSaving;
  }
}
