import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-recipe-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  templateUrl: './recipe-instructions.component.html',
  styleUrl: './recipe-instructions.component.css'
})
export class RecipeInstructionsComponent {
  @Input() instructions!: FormArray;

  constructor(private fb: FormBuilder) {}

  get instructionsControls(): FormControl[] {
    return (this.instructions?.controls || []) as FormControl[];
  }

  addStep() {
    if (!this.instructions) return;
    this.instructions.push(this.fb.control(''));
  }

  removeStep(index: number) {
    if (!this.instructions) return;
    if (this.instructions.length > 1) {
      this.instructions.removeAt(index);
    } else {
      const first = this.instructions.at(0);
      first?.setValue('');
    }
  }

  drop(event: CdkDragDrop<FormControl[]>) {
    if (!this.instructions) return;
    const prev = event.previousIndex;
    const curr = event.currentIndex;
    if (prev === curr) return;

    const control = this.instructions.at(prev);
    if (!control) return;

    this.instructions.removeAt(prev);
    this.instructions.insert(curr, control);
    this.instructions.updateValueAndValidity();
  }

}
