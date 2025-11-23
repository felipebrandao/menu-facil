import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { IngredientService } from '../../../../shared/services/ingredient.service';
import { IngredientResponse } from '../../../../shared/models/ingredient.model';
import { NewIngredientModalComponent } from '../../../../shared/components/new-ingredient-modal/new-ingredient-modal.component';
import { IngredientMapper, IngredientFormData } from '../../../../shared/mappers/ingredient.mapper';

@Component({
  selector: 'app-ingredient-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NewIngredientModalComponent],
  templateUrl: './ingredient-management.component.html'
})
export class IngredientManagementComponent implements OnInit {

  ingredients: IngredientResponse[] = [];
  filtered: IngredientResponse[] = [];

  search = '';
  loading = false;

  modalOpen = false;
  modalFormData: IngredientFormData | null = null;

  constructor(private ingredientService: IngredientService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.ingredientService.list()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: list => {
          this.ingredients = list ?? [];
          this.applyFilter();
        },
        error: () => {
          this.ingredients = [];
          this.filtered = [];
        }
      });
  }

  applyFilter(): void {
    const term = this.search.trim().toLowerCase();

    this.filtered = !term
      ? this.ingredients
      : this.ingredients.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.category?.name?.toLowerCase().includes(term) ||
        i.defaultUnit?.abbreviation?.toLowerCase().includes(term)
      );
  }

  trackById(_: number, item: IngredientResponse) {
    return item.id;
  }

  openNewModal() {
    this.modalFormData = {
      name: '',
      category: undefined,
      unit: undefined,
      conversions: []
    };
    this.modalOpen = true;
  }

  openEditModal(id: string) {
    this.modalFormData = null;
    this.modalOpen = true;

    this.ingredientService.getById(id).subscribe({
      next: (item) => {
        this.modalFormData = IngredientMapper.toFormData(item);
      },
      error: () => {
        this.modalFormData = null;
        this.modalOpen = false;
      }
    });
  }

  closeModal() {
    this.modalOpen = false;
    this.modalFormData = null;
  }

  onModalSaved(data: IngredientFormData) {
    const payload = IngredientMapper.toApiPayload(data);

    const req$ = data.id
      ? this.ingredientService.update(data.id, payload)
      : this.ingredientService.create(payload);

    req$.subscribe({
      next: saved => {
        // Atualizar lista local
        if (data.id) {
          this.ingredients = this.ingredients.map(i => i.id === saved.id ? saved : i);
        } else {
          this.ingredients = [saved, ...this.ingredients];
        }

        this.applyFilter();
        this.closeModal();
      }
    });
  }

  delete(item: IngredientResponse) {
    if (!confirm(`Excluir ingrediente "${item.name}"?`)) return;

    this.ingredientService.delete(item.id).subscribe({
      next: () => {
        this.ingredients = this.ingredients.filter(i => i.id !== item.id);
        this.applyFilter();
      }
    });
  }
}
