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
      id: '6730c5bba93b231bdf09e1a2',
      name: 'Bolo de Chocolate',
      category: 'Café da Manhã',
      prepTime: '15 min',
      cookTime: '40 min',
      servings: 8,
      mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI0Ah7W4gPQZzzH9OTnL0P6PZo82xGjsODCVh_m3RMn5s6VNO5U2EBVHwIWAthjRNL2ySt7dVLl-5bSorQBg2ZsvEBo_-DFEoxR1seM1Gw1_of_2gkrhyh9we1153WcIwGjajaFUifLxZbsyWGDgk-MXS1bKyHzD0YBnLkkS5g4VGLKcpIqyLc2TjlaLs4qfZgcUlau4TE9A0xGkIjFhBVhY8lbAQqo2wFxEDKwZD4fIllqsJVjncdG2EU6P34zmVRhXHGsZVuO8UR',
      gallery: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQTsGhREEu1SdkoAuR8MaVI1IV7mBjOK4mDvxbXJPXL9I9qEaXkCvXUabrm9s649Mzj420m-zKPRLvaxd_60sO6wIlWqy7P5L-gVV6ww6bkbnKvm_6D2dKBEoA_A2hZ0QXJjpZpBZ1W7RCns2lqAMK_4uBa7RTZi87CHlSfcoDIsihJXI6EHwaSe7eqjTlhFgs5rjh8NMqMJgj0aVXJ5phQnd8NtdFS2z11NnythoTlwMxtreL7O-y_vF-RuZYCnkMcD85yZLeNzG',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBlwmT0SPcN4fy6GA6VFF_sh9nmz0Dy7JQtbqsYoYMYhfiDYxnb9ik7QSQcWs3f3vK5RSinoneJVNXxNJ9VdmAyRV8zrXGn_5gP8GmW84CcL5VQSObIQiXP0ce1cm6xEJHCo_gxMtLk9NFkIC2AZjfxQciSkjbmVJnuuqHZSnBIDhB_y690S530mx2J8zpulQl0IFZtWxdXC-w_XGLlX_TYj1evn52e4_gwNpmZLlDpRhnKQeZvWv-3emKAg9huWB0H5kZFtz2ZWCVz',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcC3njFZaFyeXKBHdR00nhjwr6gcZHjQb4PqLvoSRyS_-1CVYup9va9gh2BRyfSyV00-FGoUCNeRoLM2w7zT-ufXsq8fz10FtfITFjPJxYTY8n52OZSc0dbbESXGXx0RGBWXeNTOQsuouik2jIn4S6iJdpzhVUTnK1NRmjijgjuiJWKFR3Jc644ZQMiQ6604mt9Kb7V3vrAJfEeyZ3TsJwZJmZAM-XY0ipLtHA847EdmxtGq7ESF93K8gdjFghfEbxm-PgBnFI_D7s',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrfXV3wZFGUP8RLvjTEAJeStLu6uFi77cLl7A4qyJwmP8u83ht4oIcSI9Jb7OkZXGSw1KhbJ8ZzH4Kd8pxuyokt0gNE7aALD_p8Cw9nIC85qAOyWH0lzgSSoD1VAzHIuKF_Jw8c_izGLVSiyeMM19isdd0_rSjAX9pSNjQxTtS-V_kUebsCQIBq407GeNaWcdINVSvHU2TsBNu-AxddcLtacM45etQG9pUdf--FRjYfU3rG9t8z4jotnqqkT4lAgmuwTKZB3EGrYB',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQTsGhREEu1SdkoAuR8MaVI1IV7mBjOK4mDvxbXJPXL9I9qEaXkCvXUabrm9s649Mzj420m-zKPRLvaxd_60sO6wIlWqy7P5L-gVV6ww6bkbnKvm_6D2dKBEoA_A2hZ0QXJjpZpBZ1W7RCns2lqAMK_4uBa7RTZi87CHlSfcoDIsihJXI6EHwaSe7eqjTlhFgs5rjh8NMqMJgj0aVXJ5phQnd8NtdFS2z11NnythoTlwMxtreL7O-y_vF-RuZYCnkMcD85yZLeNzG',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBlwmT0SPcN4fy6GA6VFF_sh9nmz0Dy7JQtbqsYoYMYhfiDYxnb9ik7QSQcWs3f3vK5RSinoneJVNXxNJ9VdmAyRV8zrXGn_5gP8GmW84CcL5VQSObIQiXP0ce1cm6xEJHCo_gxMtLk9NFkIC2AZjfxQciSkjbmVJnuuqHZSnBIDhB_y690S530mx2J8zpulQl0IFZtWxdXC-w_XGLlX_TYj1evn52e4_gwNpmZLlDpRhnKQeZvWv-3emKAg9huWB0H5kZFtz2ZWCVz',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcC3njFZaFyeXKBHdR00nhjwr6gcZHjQb4PqLvoSRyS_-1CVYup9va9gh2BRyfSyV00-FGoUCNeRoLM2w7zT-ufXsq8fz10FtfITFjPJxYTY8n52OZSc0dbbESXGXx0RGBWXeNTOQsuouik2jIn4S6iJdpzhVUTnK1NRmjijgjuiJWKFR3Jc644ZQMiQ6604mt9Kb7V3vrAJfEeyZ3TsJwZJmZAM-XY0ipLtHA847EdmxtGq7ESF93K8gdjFghfEbxm-PgBnFI_D7s'
      ],
      instructions: [
        'Pré-aqueça o forno a 180°C.',
        'Misture todos os ingredientes secos.',
        'Adicione os ingredientes líquidos e misture bem.',
        'Despeje a massa em uma forma untada.',
        'Asse por 40 minutos ou até dourar.'
      ],
      ingredients: [
        { name: 'Farinha de trigo', quantity: 200, unit: 'g' },
        { name: 'Chocolate em pó', quantity: 100, unit: 'g' },
        { name: 'Açúcar', quantity: 150, unit: 'g' },
        { name: 'Ovos', quantity: 3, unit: 'unidades' }
      ],
      rating: 4.7,
      reviews: [
        {
          user: 'João',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          rating: 5,
          comment: 'Ficou delicioso!'
        },
        {
          user: 'Maria',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          rating: 4,
          comment: 'Muito bom, mas coloquei menos açúcar.'
        }
      ],
      createdAt: "2025-10-10T19:41:00Z",
      updatedAt: "2025-10-10T20:05:00Z"
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
