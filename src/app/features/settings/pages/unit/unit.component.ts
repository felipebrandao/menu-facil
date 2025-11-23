// TypeScript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Unit } from '../../../../shared/models/ingredient.model';
import { UnitService } from '../../../../shared/services/unit.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SkeletonComponent],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css'
})
export class UnitComponent implements OnInit {
  unitForm: FormGroup;
  units: Unit[] = [];

  isLoading = false;
  isSubmitting = false;

  editingId: string | null = null;
  editName = '';
  editAbbreviation = '';

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService
  ) {
    this.unitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      abbreviation: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.isLoading = true;
    this.unitService.getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: data => (this.units = data || []),
        error: () => (this.units = [])
      });
  }

  submit(): void {
    if (this.unitForm.invalid || this.isSubmitting) {
      this.unitForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    const name = (this.unitForm.value.name || '').trim();
    const abbreviation = (this.unitForm.value.abbreviation || '').trim();

    this.unitService.create(name, abbreviation)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: created => {
          this.units = [created, ...this.units];
          this.unitForm.reset();
        }
      });
  }

  startEdit(u: Unit): void {
    this.editingId = u.id;
    this.editName = u.name;
    this.editAbbreviation = u.abbreviation;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
    this.editAbbreviation = '';
  }

  saveEdit(u: Unit): void {
    const name = (this.editName || '').trim();
    const abbreviation = (this.editAbbreviation || '').trim();

    if (!name || !abbreviation || (name === u.name && abbreviation === u.abbreviation)) {
      this.cancelEdit();
      return;
    }

    this.unitService.update(u.id, { name, abbreviation })
      .subscribe({
        next: updated => {
          this.units = this.units.map(item =>
            item.id === u.id
              ? { ...item, name: updated?.name ?? name, abbreviation: updated?.abbreviation ?? abbreviation }
              : item
          );
          this.cancelEdit();
        }
      });
  }

  delete(u: Unit): void {
    if (!confirm(`Excluir a unidade "${u.name}"?`)) return;
    this.unitService.delete(u.id)
      .subscribe({
        next: () => {
          this.units = this.units.filter(item => item.id !== u.id);
        }
      });
  }

  trackById(_: number, item: Unit) {
    return item.id;
  }

  get nameCtrl() {
    return this.unitForm.get('name');
  }

  get abbrCtrl() {
    return this.unitForm.get('abbreviation');
  }
}
