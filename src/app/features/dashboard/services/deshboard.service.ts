import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DashboardSummary, FeaturedRecipe, RecentRecipe} from '../models/dashboard.models';
import {HttpClient} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  private mockDashboardSummary: DashboardSummary = {
    weeklySchedule: {
      active: true,
      scheduleId: '6730c5bba93b231bdf09e1a2',
      startDate: '2025-10-05',
      endDate: '2025-10-11',
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

  // private mockDashboardSummary: DashboardSummary = {
  //   weeklyMenu: {
  //     active: false
  //   },
  //   shoppingList: {
  //     active: false
  //   },
  //   availableStock: {
  //     active: false
  //   }
  // };

  private mockRecentRecipes: RecentRecipe[] = [
    {
      id: '6730c5bba93b231bdf09e1a2',
      name: 'Arroz de forno',
      mainImageUrl: 'https://cdn.example.com/recipes/arroz-forno.jpg',
      category: 'Almoço',
      createdAt: '2025-10-10T13:42:10Z'
    },
    {
      id: '6730c5bba93b231bdf09e1a2',
      name: 'Panqueca de frango',
      mainImageUrl: 'https://cdn.example.com/recipes/panqueca.jpg',
      category: 'Jantar',
      createdAt: '2025-10-09T19:15:33Z'
    }
  ];

  private mockFeaturedRecipes: FeaturedRecipe[] = [
    {
      id: "6730c5bba93b231bdf09e1a2",
      title: 'Salmão com Molho de Limão',
      category: 'Prato Principal',
      mainImageUrl: 'https://example.com/images/salmao.jpg',
      rating: 4.8,
      totalTime: '30 min',
      highlighted: true
    },
    {
      id: '6730c5bba93b231bdf09e1a2',
      title: 'Hambúrguer de Frango Artesanal',
      category: 'Lanche',
      mainImageUrl: 'https://example.com/images/hamburguer.jpg',
      rating: 4.5,
      totalTime: '20 min',
      highlighted: true
    }
  ];


  getFeaturedRecipes(): Observable<{ featuredRecipes: FeaturedRecipe[] }> {
    //return this.http.get<{ featuredRecipes: FeaturedRecipe[] }>('/api/dashboard/featured-recipes');
    return new Observable(observer => {
      observer.next({ featuredRecipes: this.mockFeaturedRecipes });
      observer.complete();
    });
  }

  getRecentRecipes(): Observable<{ recent_recipes: RecentRecipe[] }> {
    //return this.http.get<{ recent_recipes: RecentRecipe[] }>('/api/dashboard/recent-recipes');
    return new Observable(observer =>{
      observer.next({ recent_recipes: this.mockRecentRecipes });
      observer.complete();
    });
  }

  getSummary(): Observable<{ summary: DashboardSummary }> {
    // return this.http.get<{ summary: DashboardSummary }>('/api/dashboard/summary');
    return new Observable(observer => {
      observer.next({ summary: this.mockDashboardSummary });
      observer.complete();
    });
  }
}

