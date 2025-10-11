import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DashboardSummary, FeaturedRecipe, RecentRecipe} from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  private mockDashboardSummary: DashboardSummary = {
    weeklyMenu: {
      active: true,
      menuId: '6730c5bba93b231bdf09e1a2',
      period: 'Oct 7 - Oct 13',
      recipesCount: 12,
      updatedAt: '2025-10-10T10:00:00Z'
    },
    shoppingList: {
      active: true,
      listId: '6730c62fa93b231bdf09e1a9',
      plannedFor: '2025-10-14',
      itemsCount: 25,
      status: 'pending'
    },
    availableStock: {
      active: true,
      itemsCount: 47,
      lowStockItems: 3,
      lastUpdated: '2025-10-09T18:22:00Z'
    }
  };

  getFeaturedRecipes(): Observable<{ featuredRecipes: FeaturedRecipe[] }> {
    return this.http.get<{ featuredRecipes: FeaturedRecipe[] }>('/api/dashboard/featured-recipes');
  }

  getRecentRecipes(): Observable<{ recent_recipes: RecentRecipe[] }> {
    return this.http.get<{ recent_recipes: RecentRecipe[] }>('/api/dashboard/recent-recipes');
  }

  getSummary(): Observable<{ summary: DashboardSummary }> {
    return this.http.get<{ summary: DashboardSummary }>('/api/dashboard/summary');
  }
}

