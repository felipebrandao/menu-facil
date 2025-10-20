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
      mainImage: 'https://images.unsplash.com/photo-1605475128023-137cf08a6d3c?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1605475128023-137cf08a6d3c?w=800',
        'https://images.unsplash.com/photo-1606756791950-0a63b50b6b88?w=800'
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
        { user: 'João', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', rating: 5, comment: 'Ficou delicioso!' },
        { user: 'Maria', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', rating: 4, comment: 'Muito bom, mas coloquei menos açúcar.' }
      ],
      createdAt: "2025-10-10T19:41:00Z",
      updatedAt: "2025-10-10T20:05:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a3',
      name: 'Panquecas Americanas',
      category: 'Café da Manhã',
      prepTime: '10 min',
      cookTime: '20 min',
      servings: 4,
      mainImage: 'https://images.unsplash.com/photo-1575859658753-1a88d64b1b6e?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1575859658753-1a88d64b1b6e?w=800'
      ],
      instructions: [
        'Misture os ingredientes secos.',
        'Adicione os líquidos e misture até ficar homogêneo.',
        'Cozinhe em frigideira antiaderente até dourar.'
      ],
      ingredients: [
        { name: 'Farinha de trigo', quantity: 200, unit: 'g' },
        { name: 'Leite', quantity: 250, unit: 'ml' },
        { name: 'Ovos', quantity: 2, unit: 'unidades' }
      ],
      rating: 4.9,
      reviews: [
        { user: 'Pedro', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', rating: 5, comment: 'As melhores panquecas!' }
      ],
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-20T10:10:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a4',
      name: 'Lasanha de Frango',
      category: 'Almoço',
      prepTime: '30 min',
      cookTime: '50 min',
      servings: 6,
      mainImage: 'https://images.unsplash.com/photo-1601050690597-37d6618f09b2?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1601050690597-37d6618f09b2?w=800'
      ],
      instructions: [
        'Monte as camadas alternando massa, molho e frango.',
        'Cubra com queijo e leve ao forno até gratinar.'
      ],
      ingredients: [
        { name: 'Massa para lasanha', quantity: 500, unit: 'g' },
        { name: 'Peito de frango', quantity: 400, unit: 'g' },
        { name: 'Molho de tomate', quantity: 300, unit: 'ml' }
      ],
      rating: 4.8,
      reviews: [
        { user: 'Ana', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', rating: 5, comment: 'Ficou perfeita!' }
      ],
      createdAt: "2025-08-15T11:20:00Z",
      updatedAt: "2025-08-15T12:00:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a5',
      name: 'Salada Caesar',
      category: 'Almoço',
      prepTime: '10 min',
      cookTime: '0 min',
      servings: 2,
      mainImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
      ],
      instructions: [
        'Misture os ingredientes e sirva com molho Caesar.'
      ],
      ingredients: [
        { name: 'Alface romana', quantity: 100, unit: 'g' },
        { name: 'Frango grelhado', quantity: 150, unit: 'g' },
        { name: 'Molho Caesar', quantity: 50, unit: 'ml' }
      ],
      rating: 4.5,
      reviews: [
        { user: 'Lucas', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', rating: 4, comment: 'Refrescante e leve.' }
      ],
      createdAt: "2025-07-10T08:00:00Z",
      updatedAt: "2025-07-10T08:10:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a6',
      name: 'Feijoada Tradicional',
      category: 'Almoço',
      prepTime: '1 h',
      cookTime: '2 h',
      servings: 10,
      mainImage: 'https://images.unsplash.com/photo-1601050690597-37d6618f09b2?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1601050690597-37d6618f09b2?w=800'
      ],
      instructions: [
        'Cozinhe as carnes com o feijão preto.',
        'Tempere e sirva com arroz e couve.'
      ],
      ingredients: [
        { name: 'Feijão preto', quantity: 500, unit: 'g' },
        { name: 'Carne seca', quantity: 300, unit: 'g' }
      ],
      rating: 5,
      reviews: [
        { user: 'Carla', avatar: 'https://randomuser.me/api/portraits/women/6.jpg', rating: 5, comment: 'Feijoada perfeita!' }
      ],
      createdAt: "2025-06-01T12:00:00Z",
      updatedAt: "2025-06-01T13:00:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a7',
      name: 'Torta de Limão',
      category: 'Sobremesa',
      prepTime: '25 min',
      cookTime: '20 min',
      servings: 6,
      mainImage: 'https://images.unsplash.com/photo-1589308078053-f3d1a2d1a5b4?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1589308078053-f3d1a2d1a5b4?w=800'
      ],
      instructions: [
        'Prepare a base com biscoitos.',
        'Faça o creme de limão e leve à geladeira.'
      ],
      ingredients: [
        { name: 'Leite condensado', quantity: 395, unit: 'g' },
        { name: 'Suco de limão', quantity: 150, unit: 'ml' }
      ],
      rating: 4.6,
      reviews: [
        { user: 'Rafaela', avatar: 'https://randomuser.me/api/portraits/women/7.jpg', rating: 4, comment: 'Ácida na medida certa!' }
      ],
      createdAt: "2025-09-02T14:00:00Z",
      updatedAt: "2025-09-02T14:15:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a8',
      name: 'Pizza Margherita',
      category: 'Jantar',
      prepTime: '20 min',
      cookTime: '15 min',
      servings: 4,
      mainImage: 'https://images.unsplash.com/photo-1601924582971-030a67c3a3f0?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1601924582971-030a67c3a3f0?w=800'
      ],
      instructions: [
        'Monte a pizza com molho, queijo e manjericão.',
        'Asse até o queijo derreter.'
      ],
      ingredients: [
        { name: 'Massa de pizza', quantity: 300, unit: 'g' },
        { name: 'Molho de tomate', quantity: 100, unit: 'ml' },
        { name: 'Mussarela', quantity: 150, unit: 'g' }
      ],
      rating: 4.9,
      reviews: [
        { user: 'Miguel', avatar: 'https://randomuser.me/api/portraits/men/8.jpg', rating: 5, comment: 'Autêntica pizza italiana!' }
      ],
      createdAt: "2025-08-25T19:00:00Z",
      updatedAt: "2025-08-25T19:10:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1a9',
      name: 'Sopa de Legumes',
      category: 'Jantar',
      prepTime: '15 min',
      cookTime: '30 min',
      servings: 5,
      mainImage: 'https://images.unsplash.com/photo-1565958011705-44e211a5e278?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1565958011705-44e211a5e278?w=800'
      ],
      instructions: [
        'Cozinhe todos os legumes até ficarem macios.'
      ],
      ingredients: [
        { name: 'Cenoura', quantity: 2, unit: 'unidades' },
        { name: 'Batata', quantity: 2, unit: 'unidades' },
        { name: 'Abobrinha', quantity: 1, unit: 'unidade' }
      ],
      rating: 4.3,
      reviews: [
        { user: 'Beatriz', avatar: 'https://randomuser.me/api/portraits/women/9.jpg', rating: 4, comment: 'Saudável e gostosa!' }
      ],
      createdAt: "2025-05-01T18:00:00Z",
      updatedAt: "2025-05-01T18:15:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1b0',
      name: 'Brownie de Chocolate',
      category: 'Sobremesa',
      prepTime: '15 min',
      cookTime: '25 min',
      servings: 8,
      mainImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800'
      ],
      instructions: [
        'Derreta o chocolate com a manteiga.',
        'Misture os outros ingredientes e asse por 25 minutos.'
      ],
      ingredients: [
        { name: 'Chocolate meio amargo', quantity: 200, unit: 'g' },
        { name: 'Açúcar', quantity: 150, unit: 'g' },
        { name: 'Farinha de trigo', quantity: 100, unit: 'g' }
      ],
      rating: 5,
      reviews: [
        { user: 'Julia', avatar: 'https://randomuser.me/api/portraits/women/10.jpg', rating: 5, comment: 'Derrete na boca!' }
      ],
      createdAt: "2025-09-28T15:30:00Z",
      updatedAt: "2025-09-28T15:40:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1b1',
      name: 'Risoto de Cogumelos',
      category: 'Jantar',
      prepTime: '20 min',
      cookTime: '30 min',
      servings: 4,
      mainImage: 'https://images.unsplash.com/photo-1617196034796-73a47bdb4c04?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1617196034796-73a47bdb4c04?w=800'
      ],
      instructions: [
        'Refogue os cogumelos, adicione o arroz e o caldo aos poucos até cozinhar.'
      ],
      ingredients: [
        { name: 'Arroz arbório', quantity: 250, unit: 'g' },
        { name: 'Cogumelos', quantity: 200, unit: 'g' },
        { name: 'Caldo de legumes', quantity: 1, unit: 'L' }
      ],
      rating: 4.7,
      reviews: [
        { user: 'Renato', avatar: 'https://randomuser.me/api/portraits/men/11.jpg', rating: 5, comment: 'Muito saboroso!' }
      ],
      createdAt: "2025-10-01T19:00:00Z",
      updatedAt: "2025-10-01T19:20:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1b2',
      name: 'Macarrão à Bolonhesa',
      category: 'Almoço',
      prepTime: '15 min',
      cookTime: '30 min',
      servings: 4,
      mainImage: 'https://images.unsplash.com/photo-1601050690597-37d6618f09b2?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1601050690597-37d6618f09b2?w=800'
      ],
      instructions: [
        'Cozinhe o macarrão e prepare o molho com carne moída e tomate.'
      ],
      ingredients: [
        { name: 'Macarrão', quantity: 250, unit: 'g' },
        { name: 'Carne moída', quantity: 300, unit: 'g' },
        { name: 'Molho de tomate', quantity: 200, unit: 'ml' }
      ],
      rating: 4.8,
      reviews: [
        { user: 'Tiago', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', rating: 5, comment: 'Tradicional e delicioso.' }
      ],
      createdAt: "2025-09-15T12:30:00Z",
      updatedAt: "2025-09-15T12:50:00Z"
    },
    {
      id: '6730c5bba93b231bdf09e1b3',
      name: 'Smoothie de Morango',
      category: 'Café da Manhã',
      prepTime: '5 min',
      cookTime: '0 min',
      servings: 2,
      mainImage: 'https://images.unsplash.com/photo-1572448862528-4c1bda0f9f5b?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1572448862528-4c1bda0f9f5b?w=800'
      ],
      instructions: [
        'Bata todos os ingredientes no liquidificador e sirva gelado.'
      ],
      ingredients: [
        { name: 'Morango', quantity: 150, unit: 'g' },
        { name: 'Iogurte natural', quantity: 200, unit: 'ml' }
      ],
      rating: 4.5,
      reviews: [
        { user: 'Sofia', avatar: 'https://randomuser.me/api/portraits/women/13.jpg', rating: 5, comment: 'Perfeito para o verão!' }
      ],
      createdAt: "2025-08-05T09:00:00Z",
      updatedAt: "2025-08-05T09:05:00Z"
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

  // let httpParams = new HttpParams();
  // if (params?.query) httpParams = httpParams.set('query', params.query);
  // if (params?.category) httpParams = httpParams.set('category', params.category);
  // if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
  // return this.http.get<{ recipes: Recipe[] }>(this.apiUrl, { params: httpParams });
  getRecipes(params?: {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    recipes: { id: string; name: string; category: string; mainImage?: string }[];
    pagination: any;
  }> {
    let recipes = this.mockRecipes;

    if (params?.query) {
      recipes = recipes.filter(r =>
        r.name.toLowerCase().includes(params.query!.toLowerCase())
      );
    }

    if (params?.category) {
      recipes = recipes.filter(r => r.category === params.category);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 8;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRecipes = recipes.slice(startIndex, endIndex);
    const total = recipes.length;
    const totalPages = Math.ceil(total / limit);

    if (paginatedRecipes.length === 0) {
      return of() as Observable<any>; // simula 204 No Content
    }

    return of({
      recipes: paginatedRecipes.map(r => ({
        id: r.id!,
        name: r.name,
        category: r.category,
        mainImage: r.mainImage
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  }

  getRecipeById(id: string): Observable<Recipe> {
    // return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
    const recipe = this.mockRecipes.find(r => r.id === id);
    return of(recipe as Recipe);
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

  updateRecipe(id: string, recipe: Recipe): Observable<CreateRecipeResponse> {
    const idx = this.mockRecipes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.mockRecipes[idx] = { ...this.mockRecipes[idx], ...recipe, id };
    } else {
      this.mockRecipes.push({ ...recipe, id } as any);
    }
    return of({
      id,
      name: recipe.name,
      category: recipe.category,
      createdAt: new Date().toISOString()
    });
  }

}
