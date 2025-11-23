import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IngredientCreateRequest, IngredientResponse} from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private apiUrl = '/api/ingredients';

  constructor(private http: HttpClient) {}

  search(query: string, limit: number): Observable<IngredientResponse[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('limit', String(limit));
    return this.http.get<IngredientResponse[]>(`${this.apiUrl}/search`, { params });
  }

  create(ingredient: IngredientCreateRequest): Observable<IngredientResponse> {
    return this.http.post<IngredientResponse>(this.apiUrl, ingredient);
  }

  list(): Observable<IngredientResponse[]> {
    return this.http.get<IngredientResponse[]>(this.apiUrl);
  }

  update(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
