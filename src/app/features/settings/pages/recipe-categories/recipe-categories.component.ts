import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {SkeletonComponent} from '../../../../shared/components/skeleton/skeleton.component';
import {RecipeCategory} from '../../../../shared/models/recipe.model';
import {RecipeCategoryService} from '../../../../shared/services/recipe-category.service';

@Component({
  selector: 'app-recipe-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SkeletonComponent],
  templateUrl: './recipe-categories.component.html',
  styleUrl: './recipe-categories.component.css'
})
export class RecipeCategoriesComponent implements OnInit {
  categoryForm: FormGroup;
  categories: RecipeCategory[] = [];

  isLoading = false;
  isSubmitting = false;

  editingId: string | null = null;
  editName = '';

  constructor(
    private fb: FormBuilder,
    private recipeCategoryService: RecipeCategoryService
) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.recipeCategoryService.getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: data => (this.categories = data || []),
        error: () => (this.categories = [])
      });
  }

  submit(): void {
    if (this.categoryForm.invalid || this.isSubmitting) {
    this.categoryForm.markAllAsTouched();
    return;
  }
  this.isSubmitting = true;

  this.recipeCategoryService.create(this.categoryForm.value.name)
    .pipe(finalize(() => (this.isSubmitting = false)))
    .subscribe({
      next: created => {
        this.categories = [created, ...this.categories];
        this.categoryForm.reset();
      }
    });
}

  startEdit(cat: RecipeCategory): void {
    this.editingId = cat.id;
    this.editName = cat.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
  }

  saveEdit(cat: RecipeCategory): void {
    const name = this.editName.trim();
    if (!name || name === cat.name) {
    this.cancelEdit();
    return;
  }

  const payload: RecipeCategory = { id: cat.id, name };

  this.recipeCategoryService.update(payload)
    .subscribe({
      next: updated => {
        this.categories = this.categories.map(c =>
          c.id === cat.id ? { ...c, name: updated?.name ?? name } : c
        );
        this.cancelEdit();
      }
    });
}

  delete(cat: RecipeCategory): void {
    if (!confirm(`Excluir a categoria "${cat.name}"?`)) return;
  this.recipeCategoryService.delete(cat.id)
    .subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== cat.id);
      }
    });
}

  trackById(_: number, item: RecipeCategory) {
    return item.id;
  }

  get nameCtrl() {
    return this.categoryForm.get('name');
  }
}
