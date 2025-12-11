import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DayResponse, MonthlyResponse, ScheduledRecipe, WeeklyResponse} from '../models/schedule.models';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = environment.apiUrl + '/api/schedule';

  constructor(private http: HttpClient) {}

  getWeekly(start: string): Observable<WeeklyResponse> {
    const params = new HttpParams()
      .set('view', 'weekly')
      .set('start', start);

    return this.http.get<WeeklyResponse>(this.apiUrl, { params });
  }

  getMonthly(year: number, month: number): Observable<MonthlyResponse> {
    const params = new HttpParams()
      .set('view', 'monthly')
      .set('year', year)
      .set('month', month);

    return this.http.get<MonthlyResponse>(this.apiUrl, { params });
  }

  getDay(date: string): Observable<DayResponse> {
    return this.http.get<DayResponse>(`${this.apiUrl}/${date}`);
  }

  addRecipe(date: string, recipeId: string): Observable<ScheduledRecipe> {
    return this.http.post<ScheduledRecipe>(`${this.apiUrl}/${date}/recipes`, {
      recipeId
    });
  }

  reorder(date: string, order: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${date}/reorder`, { order });
  }

  deleteRecipe(scheduledId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scheduled/${scheduledId}`);
  }
}
