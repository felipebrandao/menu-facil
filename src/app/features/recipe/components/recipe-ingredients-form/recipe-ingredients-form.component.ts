import { Component, EventEmitter, Input, Output, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule
} from '@angular/forms';
import { RecipeIngredient } from '../../../../shared/models/ingredient.model';
import { IngredientAutocompleteComponent } from '../../../../shared/components/ingredient-autocomplete/ingredient-autocomplete.component';
import { NewIngredientModalComponent } from '../../../../shared/components/new-ingredient-modal/new-ingredient-modal.component';

@Component({
  selector: 'app-recipe-ingredients-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IngredientAutocompleteComponent, NewIngredientModalComponent, FormsModule],
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
  @Input() units: string[] = ['g', 'ml', 'unidade'];
  @Input() ingredientError: string = '';
  @Output() ingredientsChange = new EventEmitter<RecipeIngredient[]>();

  ingredientsForm: FormArray;
  ingredientForm: FormGroup;
  showIngredientModal = false;
  editIndex: number | null = null;
  editIngredient: RecipeIngredient = { id: '', name: '', quantity: 0, unit: 'g' };

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(private fb: FormBuilder) {
    this.ingredientsForm = this.fb.array([]);
    this.ingredientForm = this.fb.group({
      id: [undefined],
      name: [''],
      quantity: [1],
      unit: ['g']
    });
  }

  ngOnInit() {}

  get ingredientsControls() {
    return this.ingredientsForm.controls as FormGroup[];
  }

  writeValue(obj: RecipeIngredient[]): void {
    this.ingredientsForm.clear();
    if (obj && obj.length) {
      obj.forEach(ing => this.ingredientsForm.push(this.fb.group({ ...ing })));
    }
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
    this.ingredientForm.patchValue({ id: event.id, name: event.name });
  }

  openNewIngredientModal(name: string) {
    this.ingredientForm.patchValue({ name });
    this.showIngredientModal = true;
  }

  onIngredientModalSaved(event: { id?: string, name: string }) {
    this.ingredientForm.patchValue({ id: event.id, name: event.name });
    this.showIngredientModal = false;
  }

  onIngredientModalClosed() {
    this.showIngredientModal = false;
  }

  addIngredient() {
    if (this.ingredientForm.value.name && this.ingredientForm.value.quantity && this.ingredientForm.value.unit) {
      this.ingredientsForm.push(this.fb.group({ ...this.ingredientForm.value }));
      this.emitChange();
      this.ingredientForm.reset({ id: undefined, name: '', quantity: 1, unit: 'g' });
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
    this.editIngredient = { ...this.ingredients[i] };
  }

  saveEdit(i: number) {
      const control = this.ingredientsForm.at(i);
      if (control) {
        control.patchValue({ ...this.editIngredient });
        this.emitChange();
      }
      this.editIndex = null;
      this.editIngredient = { id: undefined, name: '', quantity: 1, unit: 'g' };
  }

  cancelEdit() {
    this.editIndex = null;
    this.editIngredient = { id: undefined, name: '', quantity: 1, unit: 'g' };
  }
}
