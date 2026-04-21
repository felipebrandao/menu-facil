import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilePreviewPipe } from '../../../../../../shared/pipes/file-preview.pipe';

@Component({
  selector: 'app-recipe-images',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilePreviewPipe
  ],
  templateUrl: './recipe-images.component.html',
  styleUrl: './recipe-images.component.css'
})
export class RecipeImagesComponent implements OnDestroy {

  @Input() mainImage?: File;
  @Output() mainImageChange = new EventEmitter<File | undefined>();
  @Input() mainImageUrl: string | null = null;
  @Output() removeExistingMainImage = new EventEmitter<void>();

  @Input() galleryImages: File[] = [];
  @Output() galleryImagesChange = new EventEmitter<File[]>();
  @Input() galleryImageUrls: string[] = [];
  @Output() removeExistingGalleryImage = new EventEmitter<number>();
  pasteFeedbackMessage = '';
  pasteFeedbackType: 'success' | 'error' = 'success';
  private feedbackTimeoutId: number | null = null;

  get hasMainImage(): boolean {
    return !!this.mainImage || !!this.mainImageUrl;
  }

  onMainImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.mainImage = file;
    this.mainImageChange.emit(this.mainImage);
    input.value = '';
  }

  removeMainImage() {
    if (this.mainImage) {
      this.mainImage = undefined;
      this.mainImageChange.emit(undefined);
      return;
    }

    if (this.mainImageUrl) {
      this.mainImageUrl = null;
      this.removeExistingMainImage.emit();
    }
  }

  onGalleryImagesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []) as File[];
    if (files.length) {
      this.appendToGallery(files);
    }
    input.value = '';
  }

  removeGalleryImage(index: number) {
    this.galleryImages.splice(index, 1);
    this.galleryImagesChange.emit(this.galleryImages);
  }

  onRemoveExistingGalleryImage(index: number) {
    this.removeExistingGalleryImage.emit(index);
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (this.shouldIgnorePaste(event)) {
      return;
    }

    const files = this.extractImageFiles(event);
    if (!files.length) {
      this.showPasteFeedback('Nenhuma imagem encontrada na area de transferencia', 'error');
      return;
    }

    event.preventDefault();

    if (!this.hasMainImage) {
      const [first, ...remaining] = files;
      this.mainImage = first;
      this.mainImageChange.emit(this.mainImage);

      if (remaining.length) {
        this.appendToGallery(remaining);
      }
    } else {
      this.appendToGallery(files);
    }

    this.showPasteFeedback(files.length > 1 ? 'Imagens coladas com sucesso' : 'Imagem colada com sucesso', 'success');
  }

  ngOnDestroy(): void {
    if (this.feedbackTimeoutId !== null) {
      clearTimeout(this.feedbackTimeoutId);
    }
  }

  private appendToGallery(files: File[]) {
    this.galleryImages = [...this.galleryImages, ...files];
    this.galleryImagesChange.emit(this.galleryImages);
  }

  private extractImageFiles(event: ClipboardEvent): File[] {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItems = items.filter(item => item.kind === 'file' && item.type.startsWith('image/'));

    return imageItems
      .map((item, index) => {
        const file = item.getAsFile();
        if (!file) {
          return null;
        }

        const extension = file.type.split('/')[1] || 'png';
        const fileName = `clipboard-image-${Date.now()}-${index + 1}.${extension}`;
        return new File([file], fileName, { type: file.type, lastModified: Date.now() });
      })
      .filter((file): file is File => !!file);
  }

  private shouldIgnorePaste(event: ClipboardEvent): boolean {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) {
      return false;
    }

    const isInputLike = ['INPUT', 'TEXTAREA'].includes(activeElement.tagName) || activeElement.isContentEditable;
    const clipboardTypes = Array.from(event.clipboardData?.types || []);
    const hasTextType = clipboardTypes.includes('text/plain');
    return isInputLike && hasTextType;
  }

  private showPasteFeedback(message: string, type: 'success' | 'error') {
    this.pasteFeedbackMessage = message;
    this.pasteFeedbackType = type;

    if (this.feedbackTimeoutId !== null) {
      clearTimeout(this.feedbackTimeoutId);
    }

    this.feedbackTimeoutId = window.setTimeout(() => {
      this.pasteFeedbackMessage = '';
      this.feedbackTimeoutId = null;
    }, 2500);
  }
}
