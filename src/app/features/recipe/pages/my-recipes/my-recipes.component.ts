import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeSummary } from '../../../../shared/models/recipe.model';
import { RecipeService } from '../../../../shared/services/recipe.service';
import { Router } from '@angular/router';
import { RecipeCardComponent } from '../../../../shared/components/recipe-card/recipe-card.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [
    CommonModule,
    RecipeCardComponent,
    SkeletonComponent
  ],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.css'
})
export class MyRecipesComponent implements OnInit {

  recipes: RecipeSummary[] = [];
  filtered: RecipeSummary[] = [];

  query = '';
  category = 'Todas as categorias';
  sort = 'recent';

  page = 1;
  limit = 8;
  total = 0;
  totalPages = 1;

  isLoading = true;

  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading = true;
    const params: any = {
      page: this.page,
      limit: this.limit
    };
    if (this.query?.trim()) params.query = this.query.trim();
    if (this.category && this.category !== 'Todas as categorias') params.category = this.category;

    this.recipeService.getRecipes(params).subscribe((res: any) => {
      const resp = res || {};
      this.recipes = (resp.recipes || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        mainImage: r.mainImage,
        rating: r.rating,
        totalTime: r.totalTime,
        highlighted: r.highlighted,
        createdAt: r.createdAt
      })) as RecipeSummary[];

      const pagination = resp.pagination || { page: this.page, limit: this.limit, total: this.recipes.length, totalPages: 1 };
      this.total = pagination.total ?? (this.recipes.length);
      this.totalPages = pagination.totalPages ?? Math.max(1, Math.ceil(this.total / this.limit));

      this.applySort();
      this.filtered = [...this.recipes];
      this.isLoading = false;
    }, () => {
      this.recipes = [];
      this.filtered = [];
      this.total = 0;
      this.totalPages = 1;
      this.isLoading = false;
    });
  }

  onQueryChange(value: string) {
    this.query = value;
    this.page = 1;
    this.loadRecipes();
  }

  onCategoryChange(value: string) {
    this.category = value;
    this.page = 1;
    this.loadRecipes();
  }

  onSortChange(value: string) {
    this.sort = value;
    this.applySort();
  }

  applySort() {
    if (!this.recipes) return;
    if (this.sort === 'alphabet') {
      this.recipes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sort === 'popular') {
      this.recipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      this.recipes.sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
    }
    this.filtered = [...this.recipes];
  }

  goToCreateRecipe(): void {
    this.router.navigate(['/recipes/new']);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadRecipes();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadRecipes();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadRecipes();
    }
  }

  get pagesToShow(): number[] {
    const pages: number[] = [];
    const visible = 5;
    let start = Math.max(1, this.page - Math.floor(visible / 2));
    let end = start + visible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - visible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
