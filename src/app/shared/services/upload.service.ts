import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {UploadedImageResponse} from '../models/upload.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl + '/api/uploads/images';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, context?: string): Observable<UploadedImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (context) {
      formData.append('context', context);
    }

    return this.http.post<UploadedImageResponse>(this.apiUrl, formData);
  }

  uploadImages(files: File[], context?: string): Observable<UploadedImageResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    if (context) {
      formData.append('context', context);
    }

    return this.http.post<UploadedImageResponse[]>(`${this.apiUrl}/batch`, formData);
  }

  deleteImage(publicId: string): Observable<void> {
    const params = new HttpParams().set('publicId', publicId);
    return this.http.delete<void>(this.apiUrl, { params });
  }
}

