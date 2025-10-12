import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingredient, IngredientSuggestion } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private apiUrl = '/api/ingredients';

  private mockIngredientesSuggestion: IngredientSuggestion[] = [
    { id: '1', name: 'Frango desfiado' },
    { id: '2', name: 'Peito de frango' },
    { id: '3', name: 'Coxa de frango' }
  ];

  constructor(private http: HttpClient) {}

  search(query: string, limit = 3): Observable<{ ingredientSuggestion: IngredientSuggestion[] }> {
    // return this.http.get<{ ingredientSuggestion: IngredientSuggestion[] }>(
    //   `${this.apiUrl}?query=${encodeURIComponent(query)}&limit=${limit}`
    // );
    return new Observable(observer => {
      const results = this.mockIngredientesSuggestion.filter(ing =>
        ing.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      observer.next({ ingredientSuggestion: results });
      observer.complete();
    });
  }

  create(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.apiUrl, ingredient);
  }

}
