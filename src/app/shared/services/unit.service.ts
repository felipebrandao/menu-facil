import { Injectable } from '@angular/core';
import {Unit} from '../models/ingredient.model';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private apiUrl = environment.apiUrl + '/api/units';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.apiUrl).pipe(
      map(arr => Array.isArray(arr) ? arr : [])
    );
  }

  create(name: string, abbreviation: string): Observable<Unit> {
    return this.http.post<Unit>(this.apiUrl, { name, abbreviation });
  }

  update(id: string, data: { name: string; abbreviation: string }): Observable<Unit> {
    return this.http.put<Unit>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
