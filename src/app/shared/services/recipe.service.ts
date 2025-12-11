import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RecipeCreateRequest} from '../models/recipe-request.model';
import {Recipe} from '../models/recipe.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = environment.apiUrl + '/api/recipes';

  constructor(private http: HttpClient) {}

  createRecipe(payload: RecipeCreateRequest): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, payload);
  }

  getRecipes(params?: {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    recipes: any[];
    pagination: any;
  }> {
    let httpParams = new HttpParams();
    if (params?.query) httpParams = httpParams.set('query', params.query);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<{ recipes: any[]; pagination: any }>(this.apiUrl, { params: httpParams });

  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  updateRecipe(id: string, payload: RecipeCreateRequest): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, payload);

  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadMainImage(recipeId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${recipeId}/images/main`, formData);
  }

  uploadGalleryImages(recipeId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post(`${this.apiUrl}/${recipeId}/images/gallery`, formData);
  }
}
