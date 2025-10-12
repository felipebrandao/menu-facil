import { Pipe, PipeTransform, OnDestroy } from '@angular/core';

@Pipe({
  name: 'filePreview',
  standalone: true
})
export class FilePreviewPipe implements PipeTransform, OnDestroy {
  private urls = new Set<string>();

  transform(file: File | undefined | null): string | null {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    this.urls.add(url);
    return url;
  }

  ngOnDestroy() {
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
