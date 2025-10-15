import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Recipe, CreateRecipeResponse} from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = '/api/recipes';

  private mockRecipes: Recipe[] = [
    {
      name: 'Bolo de Chocolate',
      instructions: 'Misture tudo e asse por 40 minutos.',
      category: 'Café da Manhã',
      ingredients: [
        { id: '1', name: 'Farinha de trigo', quantity: 200, unit: 'g' },
        { id: '2', name: 'Chocolate em pó', quantity: 100, unit: 'g' }
      ],
      mainImage: 'https://cdn.example.com/bolo.jpg',
      gallery: ['https://cdn.example.com/bolo1.jpg']
    }
  ];


  constructor(private http: HttpClient) {}

  createRecipe(recipe: Recipe): Observable<CreateRecipeResponse> {
    // return this.http.post<CreateRecipeResponse>(this.apiUrl, recipe);

    const id = (this.mockRecipes.length + 1).toString();
    this.mockRecipes.push(recipe);
    return of({
      id,
      name: recipe.name,
      category: recipe.category,
      createdAt: new Date().toISOString()
    });

    // return new Observable(observer => {
    //   setTimeout(() => {
    //     observer.error(new Error('Erro ao salvar receita'));
    //   }, 500);
    // });
  }

  getRecipes(params?: { query?: string; category?: string; limit?: number }): Observable<{ recipes: Recipe[] }> {
    // let httpParams = new HttpParams();
    // if (params?.query) httpParams = httpParams.set('query', params.query);
    // if (params?.category) httpParams = httpParams.set('category', params.category);
    // if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    // return this.http.get<{ recipes: Recipe[] }>(this.apiUrl, { params: httpParams });
    let recipes = this.mockRecipes;
    if (params?.query) {
      recipes = recipes.filter(r => r.name.toLowerCase().includes(params.query!.toLowerCase()));
    }
    if (params?.category) {
      recipes = recipes.filter(r => r.category === params.category);
    }
    if (params?.limit) {
      recipes = recipes.slice(0, params.limit);
    }
    return of({ recipes });
  }

  getRecipeById(id: string): Observable<Recipe> {
    // return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
    const recipe = this.mockRecipes[parseInt(id, 10) - 1];
    return of(recipe);
  }

  uploadMainImage(recipeId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${recipeId}/images/main`, formData);
  }

  uploadGalleryImages(recipeId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post(`${this.apiUrl}/${recipeId}/images/gallery`, formData);
  }
}
