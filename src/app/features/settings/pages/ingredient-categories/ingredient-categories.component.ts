import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CategoryIngredient} from '../../../../shared/models/ingredient.model';
import {finalize} from 'rxjs';
import {SkeletonComponent} from '../../../../shared/components/skeleton/skeleton.component';
import {CategoriesIngredientService} from '../../../../shared/services/categories-ingredient.service';

@Component({
  selector: 'app-ingredient-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SkeletonComponent],
  templateUrl: './ingredient-categories.component.html',
  styleUrls: ['./ingredient-categories.component.css']
})
export class IngredientCategoriesComponent implements OnInit {
  categoryForm: FormGroup;
  categories: CategoryIngredient[] = [];

  isLoading = false;
  isSubmitting = false;

  editingId: string | null = null;
  editName = '';

  constructor(
    private fb: FormBuilder,
    private categoriesIngredientService: CategoriesIngredientService
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
    this.categoriesIngredientService.getAll()
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

    this.categoriesIngredientService.create(this.categoryForm.value.name)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: created => {
          this.categories = [created, ...this.categories];
          this.categoryForm.reset();
        }
      });
  }

  startEdit(cat: CategoryIngredient): void {
    this.editingId = cat.id;
    this.editName = cat.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
  }

  saveEdit(cat: CategoryIngredient): void {
    const name = this.editName.trim();
    if (!name || name === cat.name) {
      this.cancelEdit();
      return;
    }

    const payload: CategoryIngredient = { id: cat.id, name };

    this.categoriesIngredientService.update(payload)
      .subscribe({
        next: updated => {
          this.categories = this.categories.map(c =>
            c.id === cat.id ? { ...c, name: updated?.name ?? name } : c
          );
          this.cancelEdit();
        }
      });
  }

  delete(cat: CategoryIngredient): void {
    if (!confirm(`Excluir a categoria "${cat.name}"?`)) return;
    this.categoriesIngredientService.delete(cat.id)
      .subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== cat.id);
        }
      });
  }

  trackById(_: number, item: CategoryIngredient) {
    return item.id;
  }

  get nameCtrl() {
    return this.categoryForm.get('name');
  }

}
