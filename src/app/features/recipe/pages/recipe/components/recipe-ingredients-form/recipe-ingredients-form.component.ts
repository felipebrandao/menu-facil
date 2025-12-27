import {Component, EventEmitter, Input, Output, OnInit, forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule
} from '@angular/forms';
import {
  IngredientAutocompleteComponent
} from '../../../../../../shared/components/ingredient-autocomplete/ingredient-autocomplete.component';
import {IngredientService} from '../../../../../../shared/services/ingredient.service';

export interface RecipeIngredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-recipe-ingredients-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IngredientAutocompleteComponent, FormsModule],
  templateUrl: './recipe-ingredients-form.component.html',
  styleUrl: './recipe-ingredients-form.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecipeIngredientsFormComponent),
      multi: true
    }
  ]
})
export class RecipeIngredientsFormComponent implements OnInit, ControlValueAccessor {
  @Input() ingredientError: string = '';
  @Output() ingredientsChange = new EventEmitter<RecipeIngredient[]>();
  @Output() openIngredientModal = new EventEmitter<any>();

  ingredientsForm: FormArray;
  ingredientForm: FormGroup;
  editIndex: number | null = null;
  editIngredient: RecipeIngredient = {id: '', name: '', quantity: 0, unit: ''};

  availableUnits: {
    id: string,
    name: string,
    abbreviation: string
  }[] = [];

  loading = false;

  ingredientModalFormData: any = null;

  private onChange = (_: any) => {
  };
  private onTouched = () => {
  };

  constructor(private fb: FormBuilder, private ingredientService: IngredientService) {
    this.ingredientsForm = this.fb.array([]);
    this.ingredientForm = this.fb.group({
      id: [undefined],
      name: [''],
      quantity: [1],
      unit: ['']
    });
  }

  ngOnInit() {

  }

  get ingredientsControls() {
    return this.ingredientsForm.controls as FormGroup[];
  }

  writeValue(obj: any[]): void {
    this.ingredientsForm.clear();

    if (!obj || !obj.length) return;

    obj.forEach((ing) => {

      const mapped = {
        id: ing.ingredientId ?? ing.id,
        name: ing.ingredientName ?? ing.name,
        quantity: ing.quantity,
        unit: ing.unitUsedId ?? ing.unit,
        unitName: ing.unitUsed ?? ing.unitName,
        abbreviation: ing.unitUsedAbbreviation ?? ing.abbreviation
      };

      const group = this.fb.group(mapped);
      this.ingredientsForm.push(group);

      // Carrega unidades do ingrediente
      if (mapped.id) {
        this.loading = true;
        this.ingredientService.getById(mapped.id).subscribe({
          next: (ingredient) => {
            const units = ingredient.conversions.map((c: any) => ({
              id: c.toUnit.id,
              name: c.toUnit.name,
              abbreviation: c.toUnit.abbreviation
            }));

            const unitExists = units.some((u: any) => u.id === mapped.unit);
            const finalUnit = unitExists ? mapped.unit : units[0]?.id;

            group.patchValue({
              unit: finalUnit,
              unitName: units.find((u: any) => u.id === finalUnit)?.name ?? null,
              abbreviation: units.find((u: any) => u.id === finalUnit)?.abbreviation ?? null
            });

            this.loading = false;
          },
          error: (err) => {
            console.error("Erro carregando ingrediente no writeValue:", err);
            this.loading = false;
          },
        });
      }
    });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.ingredientsForm.disable();
      this.ingredientForm.disable();
    } else {
      this.ingredientsForm.enable();
      this.ingredientForm.enable();
    }
  }

  onIngredientSelected(event: { id?: string, name: string }) {
    this.ingredientForm.patchValue({id: event.id, name: event.name});

    if (event.id != null) {
      this.loadUnitsForIngredient(event.id, this.ingredientForm.value.unit, false);
    }
  }

  openNewIngredientModal(name: string) {
    this.ingredientForm.patchValue({name});
    this.openIngredientModal.emit({
      mode: 'create',
      name
    });
  }

  addIngredient() {
    if (this.ingredientForm.value.name && this.ingredientForm.value.quantity && this.ingredientForm.value.unit) {
      this.ingredientsForm.push(this.fb.group({
        id: this.ingredientForm.value.id,
        name: this.ingredientForm.value.name,
        quantity: this.ingredientForm.value.quantity,
        unit: this.ingredientForm.value.unit,
        unitName: this.availableUnits.find(u => u.id === this.ingredientForm.value.unit)?.name
      }));
      this.emitChange();
      this.ingredientForm.reset({
        id: undefined,
        name: '',
        quantity: 1,
        unit: this.availableUnits[0]?.id ?? ''
      });
    }
  }

  removeIngredient(i: number) {
    this.ingredientsForm.removeAt(i);
    this.emitChange();
  }

  emitChange() {
    const value = this.ingredientsForm.value as RecipeIngredient[];
    this.ingredientsChange.emit(value);
    this.onChange(value);
    this.onTouched();
  }

  get quantityControl() {
    return this.ingredientForm.get('quantity') as import('@angular/forms').FormControl;
  }

  get unitControl() {
    return this.ingredientForm.get('unit') as import('@angular/forms').FormControl;
  }

  get ingredients() {
    return this.ingredientsForm.value;
  }

  startEdit(i: number) {
    this.editIndex = i;
    this.editIngredient = {...this.ingredients[i]};
    if (this.editIngredient.id) {
      this.loadUnitsForIngredient(this.editIngredient.id, this.editIngredient.unit, true);
    }
  }

  saveEdit(i: number) {
    const control = this.ingredientsForm.at(i);
    if (control) {
      control.patchValue({
        ...this.editIngredient,
        unitName: this.availableUnits.find(u => u.id === this.editIngredient.unit)?.name
      }, {emitEvent: false});
      this.emitChange();
    }
    this.editIndex = null;
    this.editIngredient = {id: undefined, name: '', quantity: 1, unit: ''};
  }

  cancelEdit() {
    this.editIndex = null;
    this.editIngredient = {
      id: undefined,
      name: '',
      quantity: 1,
      unit: this.availableUnits.length ? this.availableUnits[0].id : ''
    };
  }

  private loadUnitsForIngredient(id: string, currentUnit?: string, applyToEdit = false) {
    this.loading = true;
    this.ingredientService.getById(id).subscribe({
      next: (ingredient) => {
        const units = [
          ...ingredient.conversions.map((c: any) => ({
            id: c.toUnit.id,
            name: c.toUnit.name,
            abbreviation: c.toUnit.abbreviation
          }))
        ];

        this.availableUnits = units;

        const defaultUnit =
          currentUnit && units.some(u => u.id === currentUnit)
            ? currentUnit
            : units[0]?.id;

        if (applyToEdit) {
          this.editIngredient.unit = defaultUnit;
        } else {
          this.ingredientForm.patchValue({unit: defaultUnit});
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Erro ao carregar ingrediente", err);
        this.availableUnits = [];
        this.loading = false;
      }
    });
  }

  getUnitAbbreviation(index: number): string {
    return this.ingredientsForm.at(index)?.get('abbreviation')?.value ?? '';
  }

  openEditIngredientModal() {
    const ingredientId = this.ingredientForm.value.id;

    if (!ingredientId) return;

    this.loading = true;
    this.ingredientService.getById(ingredientId).subscribe({
      next: (ingredient) => {
        this.openIngredientModal.emit({
          mode: 'edit',
          data: {
            id: ingredient.id,
            name: ingredient.name,
            category: ingredient.category?.id,
            defaultUnit: ingredient.defaultUnit,
            conversions: ingredient.conversions?.map((c: any) => ({
              toUnit: c.toUnit,
              factor: c.factor
            })) ?? []
          }
        });
        this.loading = false;
      },
      error: (err) => {
        console.error("Erro ao carregar ingrediente para edição:", err);
        this.loading = false;
      }
    });
  }

  onIngredientModalSaved(savedIngredient: any) {
    this.ingredientForm.patchValue({
      id: savedIngredient.id,
      name: savedIngredient.name
    });

    if (savedIngredient.id) {
      this.loadUnitsForIngredient(savedIngredient.id, this.ingredientForm.value.unit, false);
    }
  }

}
