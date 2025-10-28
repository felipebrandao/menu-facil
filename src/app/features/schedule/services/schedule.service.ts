import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {DayResponse, MonthlyResponse, ScheduledRecipe, WeeklyResponse} from '../models/schedule.models';
import {RecipeSummary} from '../../../shared/models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  // Catálogo mínimo para popular `recipeSummary` nos agendamentos
  private recipeCatalog: Record<string, RecipeSummary> = {
    '6730c5bba93b231bdf09e1a2': { id: '6730c5bba93b231bdf09e1a2', name: 'Bolo de Chocolate', category: 'Café da Manhã' },
    '6730c5bba93b231bdf09e1a3': { id: '6730c5bba93b231bdf09e1a3', name: 'Panquecas Americanas', category: 'Café da Manhã' },
    '6730c5bba93b231bdf09e1a4': { id: '6730c5bba93b231bdf09e1a4', name: 'Lasanha de Frango', category: 'Almoço' },
    '6730c5bba93b231bdf09e1a8': { id: '6730c5bba93b231bdf09e1a8', name: 'Pizza Margherita', category: 'Jantar' }
  };

  // Armazenamento em memória: chave = 'YYYY-MM-DD'
  private store: Record<string, ScheduledRecipe[]> = {};

  private apiUrl = '/api/schedule';

  constructor(private http: HttpClient) {
    // Seed inicial para testes
    const today = new Date();
    const todayKey = this.format(today);
    const tomorrowKey = this.format(this.addDays(today, 1));

    this.store[todayKey] = [
      this.mkScheduled(this.recipeCatalog['6730c5bba93b231bdf09e1a4'], 0),
      this.mkScheduled(this.recipeCatalog['6730c5bba93b231bdf09e1a8'], 1)
    ];
    this.store[tomorrowKey] = [
      this.mkScheduled(this.recipeCatalog['6730c5bba93b231bdf09e1a2'], 0)
    ];
  }

  // getWeekly(start: string): Observable<WeeklyResponse> {
  //   const params = new HttpParams()
  //     .set('view', 'weekly')
  //     .set('start', start);
  //   return this.http.get<WeeklyResponse>(this.apiUrl, { params });
  // }

// Weekly: recebe `start` (YYYY-MM-DD) e retorna a semana [start..start+6]
  getWeekly(start: string): Observable<WeeklyResponse> {
    const startDate = this.parse(start);
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = this.addDays(startDate, i);
      const key = this.format(d);
      const arr = this.clone(this.store[key] || []);
      return {
        date: key,
        recipes: arr,
        hasRecipes: arr.length > 0,
        recipesCount: arr.length
      };
    });

    return of({
      view: 'weekly',
      start,
      end: this.format(this.addDays(startDate, 6)),
      days
    });
  }

  // getMonthly(year: number, month: number): Observable<MonthlyResponse> {
  //   const params = new HttpParams()
  //     .set('view', 'monthly')
  //     .set('year', String(year))
  //     .set('month', String(month));
  //   return this.http.get<MonthlyResponse>(this.apiUrl, { params });
  // }

  // Monthly: `month` 1-12; retorna apenas os dias do mês
  getMonthly(year: number, month: number): Observable<MonthlyResponse> {
    const m0 = month - 1;
    const first = new Date(year, m0, 1);
    const last = new Date(year, m0 + 1, 0);

    const days: MonthlyResponse['days'] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, m0, d);
      const key = this.format(date);
      const arr = this.clone(this.store[key] || []);
      days.push({
        date: key,
        recipes: arr,
        hasRecipes: arr.length > 0,
        recipesCount: arr.length
      });
    }

    return of({
      view: 'monthly',
      start: this.format(first),
      end: this.format(last),
      days
    });
  }

  // getDay(date: string): Observable<DayResponse> {
  //   const url = `${this.apiUrl}/${date}`;
  //   return this.http.get<DayResponse>(url);
  // }

  // Day detail
  getDay(date: string): Observable<DayResponse> {
    const arr = this.clone(this.store[date] || []);
    return of({
      date,
      recipes: arr.map(r => ({
        id: r.id,
        summary: r.recipeSummary!,
        order: r.order
      }))
    });
  }

  // addRecipe(date: string, recipeId: string): Observable<ScheduledRecipe> {
  //   const url = `${this.apiUrl}/${date}/recipes`;
  //   return this.http.post<ScheduledRecipe>(url, { recipeId });
  // }

  // Add recipe to day
  addRecipe(date: string, recipeId: string): Observable<ScheduledRecipe> {
    const list = this.store[date] ?? (this.store[date] = []);
    const summary = this.recipeCatalog[recipeId] ?? { id: recipeId, category: 'Outros' };
    const scheduled = this.mkScheduled(summary, list.length);
    list.push(scheduled);
    return of(this.clone(scheduled));
  }

  // reorder(date: string, order: string[]): Observable<void> {
  //   const url = `${this.apiUrl}/${date}/reorder`;
  //   return this.http.patch<void>(url, { order });
  // }

  // Reorder recipes in a day; `order` é lista de IDs de agendamento
  reorder(date: string, order: string[]): Observable<void> {
    const list = this.store[date] ?? [];
    list.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    list.forEach((it, idx) => (it.order = idx));
    return of(void 0);
  }

  // deleteRecipe(id: string): Observable<void> {
  //   const url = `${this.apiUrl}/${id}`;
  //   return this.http.delete<void>(url);
  // }

  // Delete scheduled recipe by scheduled id
  deleteRecipe(id: string): Observable<void> {
    for (const dateKey of Object.keys(this.store)) {
      const list = this.store[dateKey] ?? [];
      const idx = list.findIndex(it => it.id === id);
      if (idx !== -1) {
        list.splice(idx, 1);
        this.store[dateKey] = list.map((it, i) => ({ ...it, order: i }));
        break;
      }
    }
    return of(void 0);
  }

  // Helpers
  private mkScheduled(summary: RecipeSummary, order: number): ScheduledRecipe {
    return {
      id: `sch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      recipeSummary: summary,
      order,
      recipeId: summary.id
    };
  }

  private format(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parse(s: string): Date {
    const [y, m, d] = s.split('-').map(n => parseInt(n, 10));
    return new Date(y, m - 1, d);
  }

  private addDays(d: Date, n: number): Date {
    const c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  }

  private clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
  }
}
