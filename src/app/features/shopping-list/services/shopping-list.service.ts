import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ShoppingListResponse, ShoppingListView } from '../models/shopping-list.models';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private readonly apiUrl = environment.apiUrl + '/api/shopping-list';

  constructor(private readonly http: HttpClient) {}

  generate(params: {
    view: ShoppingListView;
    start?: string;
    year?: number;
    month?: number;
  }): Observable<ShoppingListResponse> {
    let httpParams = new HttpParams().set('view', params.view);

    if (params.start) httpParams = httpParams.set('start', params.start);
    if (typeof params.year === 'number') httpParams = httpParams.set('year', String(params.year));
    if (typeof params.month === 'number') httpParams = httpParams.set('month', String(params.month));

    return this.http
      .get<ShoppingListResponse>(this.apiUrl, { params: httpParams, observe: 'response' })
      .pipe(
        map((res) => {
          if (res.status === 204 || !res.body) {
            return {
              view: params.view,
              start: params.start ?? '',
              end: '',
              recipes: [],
              categories: [],
            };
          }

          // garante defaults para evitar NPE no componente
          return {
            ...res.body,
            recipes: res.body.recipes ?? [],
            categories: res.body.categories ?? [],
          };
        })
      );
  }
}
