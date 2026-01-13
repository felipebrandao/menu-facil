import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ShoppingListItemResponse = {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
};

export type ShoppingListCategoryResponse = {
  categoryId: string;
  categoryName: string;
  items: ShoppingListItemResponse[];
};

export type ShoppingListResponse = {
  view: string;
  start: string; // ISO date
  end: string; // ISO date
  categories: ShoppingListCategoryResponse[];
};

export type ShoppingListView = 'weekly' | 'monthly';

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
              categories: [],
            };
          }

          return res.body;
        })
      );
  }
}
