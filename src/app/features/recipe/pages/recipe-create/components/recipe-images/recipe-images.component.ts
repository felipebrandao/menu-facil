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

  @Input() galleryImages: File[] = [];
  @Output() galleryImagesChange = new EventEmitter<File[]>();

  onMainImageChange(event: any) {
    const file = event.target.files && event.target.files[0];
    this.mainImage = file;
    this.mainImageChange.emit(this.mainImage);
    event.target.value = '';
  }

  removeMainImage() {
    this.mainImage = undefined;
    this.mainImageChange.emit(undefined);
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
}
