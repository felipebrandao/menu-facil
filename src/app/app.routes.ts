import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'recipes/new',
    loadComponent: () =>
      import('./features/recipe/pages/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'receitas/:id',
    loadComponent: () =>
      import('./features/recipe/pages/recipe-view/recipe-view.component').then(
        (m) => m.RecipeViewComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
