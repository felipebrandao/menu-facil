import {Component, Inject, OnInit, Optional, Input, Output, EventEmitter} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import {IngredientService} from '../../services/ingredient.service';
import {UnitService} from '../../services/unit.service';
import {CategoriesIngredientService} from '../../services/categories-ingredient.service';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {IngredientFormData} from '../../mappers/ingredient.mapper';
import {SkeletonComponent} from '../skeleton/skeleton.component';

@Component({
  selector: 'app-new-ingredient-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SkeletonComponent
  ],
  templateUrl: './new-ingredient-modal.component.html',
})
export class NewIngredientModalComponent implements OnInit {
  private _formData?: IngredientFormData | null;

  @Input()
  set formData(value: IngredientFormData | null | undefined) {
    this._formData = value ?? null;
    if (this.form) {
      if (this._formData) {
        this.patchForm();
      } else {
        this.form.reset();
        this.conversions.clear?.() ?? this.clearConversionsManually();
      }
    }
  }

  get formData(): IngredientFormData | null | undefined {
    return this._formData ?? undefined;
  }

  @Output() saved = new EventEmitter<IngredientFormData>();
  @Output() closed = new EventEmitter<boolean>();

  form!: FormGroup;
  newConversion!: FormGroup;

  categories: any[] = [];
  units: any[] = [];

  loadingCategories = false;
  loadingUnits = false;

  isSaving = false;

  constructor(
    private fb: FormBuilder,
    @Optional() private dialogRef?: MatDialogRef<NewIngredientModalComponent>,
    private categoriesIngredientService?: CategoriesIngredientService,
    private unitService?: UnitService,
    private ingredientService?: IngredientService,
    @Optional() @Inject(MAT_DIALOG_DATA) public injectedData?: any
  ) {
  }

  ngOnInit(): void {
    this.createForm();
    this.createConversionForm();

    if (this.categoriesIngredientService) this.loadCategories();
    if (this.unitService) this.loadUnits();

    if (!this._formData && this.injectedData) {
      this._formData = this.injectedData;
    }

    if (this._formData) this.patchForm();
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      unit: ['', Validators.required],
      conversions: this.fb.array([]),
    });
  }

  createConversionForm() {
    this.newConversion = this.fb.group({
      toUnit: ['', Validators.required],
      factor: ['', [Validators.required, Validators.min(0.00001)]],
    });
  }

  get isModalLoading(): boolean {
    return this.loadingUnits || this.loadingCategories || this._formData === null;
  }

  get conversions(): FormArray {
    return this.form.get('conversions') as FormArray;
  }

  get newConversionToUnit(): FormControl {
    return this.newConversion.get('toUnit') as FormControl;
  }

  get newConversionFactor(): FormControl {
    return this.newConversion.get('factor') as FormControl;
  }

  private clearConversionsManually() {
    while (this.conversions.length) {
      this.conversions.removeAt(0);
    }
  }

  loadCategories() {
    this.loadingCategories = true;
    this.categoriesIngredientService!.getAll().subscribe({
      next: (res) => (this.categories = res),
      complete: () => (this.loadingCategories = false),
    });
  }

  loadUnits() {
    this.loadingUnits = true;
    this.unitService!.getAll().subscribe({
      next: (res) => (this.units = res),
      complete: () => (this.loadingUnits = false),
    });
  }

  patchForm() {
    this.conversions.clear?.() ?? this.clearConversionsManually();

    const fd: any = this._formData ?? {};

    const categoryVal = typeof fd.category === 'string' ? fd.category : fd.category?.id ?? '';
    const unitVal =
      fd.unit ??
      fd.defaultUnit?.id ??
      fd.defaultUnit ??
      '';

    this.form.patchValue({
      name: fd.name ?? '',
      category: categoryVal,
      unit: unitVal,
    });

    if (fd.conversions?.length) {
      fd.conversions.forEach((c: any) => {
        const toUnit = typeof c.toUnit === 'string' ? c.toUnit : c.toUnit?.id ?? c.toUnit ?? '';
        const factor = c.factor ?? 0;

        this.conversions.push(
          this.fb.group({
            toUnit: [toUnit, Validators.required],
            factor: [factor, Validators.required],
          })
        );
      });
    }
  }

  confirmAddConversion() {
    if (this.newConversion.invalid) return;

    this.conversions.push(
      this.fb.group({
        toUnit: [this.newConversion.value.toUnit, Validators.required],
        factor: [this.newConversion.value.factor, Validators.required],
      })
    );

    this.newConversion.reset();
  }

  removeConversion(index: number) {
    this.conversions.removeAt(index);
  }

  unitLabel(unitId: string) {
    const u = this.units.find((x) => x.id === unitId);
    return u ? u.abbreviation : '?';
  }

  save() {
    if (this.form.invalid) return;
    this.isSaving = true;

    const formData: IngredientFormData = {
      id: this._formData?.id || undefined,
      name: this.form.value.name,
      category: this.form.value.category || undefined,
      unit: this.form.value.unit || undefined,
      conversions: (this.form.value.conversions ?? []).map((c: any) => ({
        toUnit: c.toUnit,
        factor: Number(c.factor),
      })),
    };

    if (this.dialogRef) {
      this.dialogRef.close(formData);
    } else {
      this.saved.emit(formData);
    }

    this.isSaving = false;
  }

  cancel() {
    if (this.dialogRef) {
      this.dialogRef.close(null);
    } else {
      this.closed.emit(false);
    }
  }
}
