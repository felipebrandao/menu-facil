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
      import('./features/recipe/pages/recipe-create/recipe-create.component').then(
        (m) => m.RecipeCreateComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' }, // rota coringa
];
