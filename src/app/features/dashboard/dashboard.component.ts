  import {Component, OnInit} from '@angular/core';
  import { CommonModule } from '@angular/common';
  import {Router, RouterLink} from '@angular/router';
  import {RecipeCardComponent} from '../../shared/components/recipe-card/recipe-card.component';
  import {DashboardInfoCardComponent} from './components/dashboard-info-card/dashboard-info-card.component';
  import {DashboardSummary, FeaturedRecipe, RecentRecipe} from './models/dashboard.models';
  import {DashboardService} from './services/deshboard.service';
  import { format, parseISO } from 'date-fns';
  import { ptBR } from 'date-fns/locale';

  interface FeatureCard {
    tagText: string;
    cardColor: 'green' | 'blue' | 'yellow';
    title: string;
    description: string;
    linkUrl: string;
    linkText: string;
    linkIcon: string;
  }

  @Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RecipeCardComponent, DashboardInfoCardComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent implements OnInit {
    user = 'Vivian';

    featuredRecipes: FeaturedRecipe[] = [];
    recentRecipes: RecentRecipe[] = [];
    summary?: DashboardSummary;

    featureCards: FeatureCard[] = [];

    constructor(
      private dashboardService: DashboardService,
      private router: Router
    ) {}

    ngOnInit() {
      this.dashboardService.getFeaturedRecipes().subscribe(res => {
        this.featuredRecipes = res.featuredRecipes;
      });

      this.dashboardService.getRecentRecipes().subscribe(res => {
        this.recentRecipes = res.recent_recipes;
      });

      this.dashboardService.getSummary().subscribe(res => {
        this.summary = res.summary;
        this.featureCards = this.buildFeatureCards(this.summary);
      });
    }

    buildFeatureCards(summary: DashboardSummary): FeatureCard[] {
      const getWeekPeriod = (active?: boolean, start?: string, end?: string) => {
        if (active && start && end) {
          const startDate = parseISO(start);
          const endDate = parseISO(end);
          return `Semana de ${format(startDate, "d 'de' MMMM", { locale: ptBR })} a ${format(endDate, "d 'de' MMMM", { locale: ptBR })}`;
        }
        return 'Nenhum cronograma ativo';
      };

      const getShoppingListDate = (active?: boolean, plannedFor?: string) => {
        if (active && plannedFor) {
          const date = parseISO(plannedFor);
          return `Lista para ${format(date, "d 'de' MMMM", { locale: ptBR })}`;
        }
        return 'Nenhuma lista ativa';
      };

      const getStockUpdatedAt = (active?: boolean, lastUpdated?: string) => {
        if (active && lastUpdated) {
          const date = parseISO(lastUpdated);
          return `Atualizado em ${format(date, "d 'de' MMMM", { locale: ptBR })}`;
        }
        return 'Estoque não cadastrado';
      };

      return [
        {
          tagText: getWeekPeriod(summary.weeklySchedule.active, summary.weeklySchedule.startDate, summary.weeklySchedule.endDate),
          cardColor: 'green',
          title: 'Cronograma da Semana',
          description: summary.weeklySchedule.active
            ? 'Planeje suas refeições com antecedência e economize tempo.'
            : 'Comece a planejar suas refeições para organizar sua rotina.',
          linkUrl: '/cardapios',
          linkText: summary.weeklySchedule.active ? 'Ver Cronograma' : 'Criar Cronograma',
          linkIcon: 'arrow_forward',
        },
        {
          tagText: getShoppingListDate(summary.shoppingList.active, summary.shoppingList.plannedFor),
          cardColor: 'blue',
          title: 'Próxima Lista de Compras',
          description: summary.shoppingList.active
            ? 'Verifique os itens que você precisa para a próxima semana.'
            : 'Gere sua primeira lista a partir de um cronograma ou adicione itens manualmente.',
          linkUrl: '/lista-de-compras',
          linkText: summary.shoppingList.active ? 'Ver Lista' : 'Gerar Lista',
          linkIcon: 'list_alt',
        },
        {
          tagText: getStockUpdatedAt(summary.availableStock.active, summary.availableStock.lastUpdated),
          cardColor: 'yellow',
          title: 'Status do Estoque',
          description: summary.availableStock.active
            ? 'Mantenha o controle dos seus ingredientes e evite desperdícios.'
            : 'Adicione seus ingredientes para ter controle total da sua despensa.',
          linkUrl: '/estoque',
          linkText: summary.availableStock.active ? 'Ver Estoque' : 'Gerenciar Estoque',
          linkIcon: 'inventory',
        }
      ];
    }

    goToCreateRecipe() {
      this.router.navigate(['/recipes/new']);
    }
  }
