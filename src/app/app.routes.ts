import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },

  // Rotas futuras
  // {
  //   path: 'receitas',
  //   loadComponent: () =>
  //     import('./features/receitas/receitas.component').then(
  //       (m) => m.ReceitasComponent
  //     ),
  // },
  // {
  //   path: 'cardapios',
  //   loadComponent: () =>
  //     import('./features/cardapios/cardapios.component').then(
  //       (m) => m.CardapiosComponent
  //     ),
  // },
  // {
  //   path: 'compras',
  //   loadComponent: () =>
  //     import('./features/compras/compras.component').then(
  //       (m) => m.ComprasComponent
  //     ),
  // },
  // {
  //   path: 'estoque',
  //   loadComponent: () =>
  //     import('./features/estoque/estoque.component').then(
  //       (m) => m.EstoqueComponent
  //     ),
  // },

  { path: '**', redirectTo: 'dashboard' }, // rota coringa
];
