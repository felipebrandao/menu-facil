import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class RecipeImagesComponent {

  @Input() mainImage?: File;
  @Output() mainImageChange = new EventEmitter<File | undefined>();
  @Input() mainImageUrl: string | null = null;
  @Output() removeExistingMainImage = new EventEmitter<void>();

  @Input() galleryImages: File[] = [];
  @Output() galleryImagesChange = new EventEmitter<File[]>();
  @Input() galleryImageUrls: string[] = [];
  @Output() removeExistingGalleryImage = new EventEmitter<number>();

  get hasMainImage(): boolean {
    return !!this.mainImage || !!this.mainImageUrl;
  }

  onMainImageChange(event: any) {
    const file = event.target.files && event.target.files[0];
    this.mainImage = file;
    this.mainImageChange.emit(this.mainImage);
    event.target.value = '';
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

  onGalleryImagesChange(event: any) {
    const files = Array.from(event.target.files || []) as File[];
    if (files.length) {
      this.galleryImages = [...this.galleryImages, ...files];
      this.galleryImagesChange.emit(this.galleryImages);
    }
    event.target.value = '';
  }

  removeGalleryImage(index: number) {
    this.galleryImages.splice(index, 1);
    this.galleryImagesChange.emit(this.galleryImages);
  }

  onRemoveExistingGalleryImage(index: number) {
    this.removeExistingGalleryImage.emit(index);
  }
}
