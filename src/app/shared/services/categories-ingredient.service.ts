import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoryIngredient} from '../models/ingredient.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesIngredientService {

  private apiUrl = environment.apiUrl + '/api/categories-ingredient';

  constructor(private http: HttpClient) { }

  getAll(): Observable<CategoryIngredient[]> {
    return this.http.get<CategoryIngredient[]>(this.apiUrl);
  }

  create(name: string): Observable<CategoryIngredient> {
    return this.http.post<CategoryIngredient>(this.apiUrl, { name });
  }

  update(data: CategoryIngredient): Observable<CategoryIngredient> {
    const id = encodeURIComponent(data.id as string);
    return this.http.put<CategoryIngredient>(`${this.apiUrl}/${id}`, { name: data.name });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
