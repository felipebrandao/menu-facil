import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'my-recipes',
    loadComponent: () =>
      import('./features/recipe/pages/my-recipes/my-recipes.component').then(
        (m) => m.MyRecipesComponent
      ),
  },
  {
    path: 'recipes/new',
    loadComponent: () =>
      import('./features/recipe/pages/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'recipes/edit/:id',
    loadComponent: () =>
      import('./features/recipe/pages/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./features/recipe/pages/recipe-view/recipe-view.component').then(
        (m) => m.RecipeViewComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
