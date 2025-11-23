import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {RecipeCategory} from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeCategoryService {

  private apiUrl = '/api/recipe-categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RecipeCategory[]> {
    return this.http.get<RecipeCategory[]>(this.apiUrl);
  }

  create(name: string): Observable<RecipeCategory> {
    return this.http.post<RecipeCategory>(this.apiUrl, { name });
  }

  update(data: RecipeCategory): Observable<RecipeCategory> {
    const id = encodeURIComponent(data.id);
    return this.http.put<RecipeCategory>(`${this.apiUrl}/${id}`, { name: data.name });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
