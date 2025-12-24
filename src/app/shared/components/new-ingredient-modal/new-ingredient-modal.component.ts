import {Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {UnitService} from '../../services/unit.service';
import {CategoriesIngredientService} from '../../services/categories-ingredient.service';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {IngredientFormData} from '../../mappers/ingredient.mapper';
import {SkeletonComponent} from '../skeleton/skeleton.component';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { IngredientService } from '../../services/ingredient.service';
import { IngredientMapper } from '../../mappers/ingredient.mapper';

@Component({
  selector: 'app-new-ingredient-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SkeletonComponent,
    SuccessModalComponent,
    ErrorModalComponent
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

  showSuccessModal = false;
  showErrorModal = false;
  errorMessage = '';
  errorDetails = '';

  private _savedIngredient?: any;

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

    this.form.get('defaultUnit')?.valueChanges.subscribe(unitId => {
      if (unitId) {
        this.ensureDefaultUnitConversion(unitId);
      }
    });
  }

  private ensureDefaultUnitConversion(defaultUnitId: string) {
    const existingIndex = this.conversions.controls.findIndex(
      c => c.get('toUnit')?.value === defaultUnitId
    );

    if (existingIndex === -1) {
      this.conversions.insert(0, this.fb.group({
        toUnit: [defaultUnitId, Validators.required],
        factor: [1, Validators.required],
        isDefault: [true] // Flag para identificar
      }));
    } else {
      this.conversions.at(existingIndex).patchValue({
        factor: 1,
        isDefault: true
      });
    }
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      defaultUnit: ['', Validators.required],
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
      defaultUnit: unitVal,
    });

    if (unitVal) {
      this.conversions.push(
        this.fb.group({
          toUnit: [unitVal, Validators.required],
          factor: [1, Validators.required],
          isDefault: [true]
        })
      );
    }

    if (fd.conversions?.length) {
      fd.conversions.forEach((c: any) => {
        const toUnit = typeof c.toUnit === 'string' ? c.toUnit : c.toUnit?.id ?? c.toUnit ?? '';
        const factor = c.factor ?? 0;

        if (toUnit !== unitVal) {
          this.conversions.push(
            this.fb.group({
              toUnit: [toUnit, Validators.required],
              factor: [factor, Validators.required],
              isDefault: [false]
            })
          );
        }
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
    const conversion = this.conversions.at(index);
    if (conversion.get('isDefault')?.value === true) {
      return;
    }
    this.conversions.removeAt(index);
  }

  isDefaultConversion(index: number): boolean {
    return this.conversions.at(index)?.get('isDefault')?.value === true;
  }

  unitLabel(unitId: string) {
    const u = this.units.find((x) => x.id === unitId);
    return u ? u.abbreviation : '?';
  }

  save() {
    if (this.form.invalid || !this.ingredientService) return;
    this.isSaving = true;

    const formData: IngredientFormData = {
      id: this._formData?.id || undefined,
      name: this.form.value.name,
      category: this.form.value.category || undefined,
      defaultUnit: this.form.value.defaultUnit || undefined,
      conversions: (this.form.value.conversions ?? []).map((c: any) => ({
        toUnit: c.toUnit,
        factor: Number(c.factor),
      })),
    };

    const payload = IngredientMapper.toApiPayload(formData);

    const req$ = formData.id
      ? this.ingredientService.update(formData.id, payload)
      : this.ingredientService.create(payload);

    req$.subscribe({
      next: (savedIngredient) => {
        this.isSaving = false;
        this.showSuccessModal = true;
        this._savedIngredient = savedIngredient;
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = 'Erro ao salvar ingrediente';
        this.errorDetails = error?.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
        this.showErrorModal = true;
      }
    });
  }

  cancel() {
    if (this.dialogRef) {
      this.dialogRef.close(null);
    } else {
      this.closed.emit(false);
    }
  }

  handleSuccessClose() {
    this.showSuccessModal = false;

    if (this.dialogRef) {
      this.dialogRef.close({
        success: true,
        data: this._savedIngredient
      });
    } else {
      this.saved.emit(this._savedIngredient);
    }
  }

  handleErrorRetry() {
    this.showErrorModal = false;
    this.save();
  }

  handleErrorCancel() {
    this.showErrorModal = false;
    this.isSaving = false;
  }

}
