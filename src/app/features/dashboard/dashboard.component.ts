import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
import {RecipeCardComponent} from '../../shared/recipe-card/recipe-card.component';
import {DashboardInfoCardComponent} from './components/dashboard-info-card/dashboard-info-card.component';

interface Recipe {
  title: string;
  category: string;
  image: string;
}

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
export class DashboardComponent {
  user = 'Vivian';

  featuredRecipes: Recipe[] = [
    {
      title: 'Salmão com Molho de Limão',
      category: 'Prato Principal',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAEG1oes2EihcMB4z_0v_N1Z_WC3MXSj9UcSHBCIu5X6e2jvzBMkP47lgMsXBmSlzoAAUOHtB0-Epv05NGlrVqB_9hQws-9YsvC56MW92fKLzJ3AMYD1IVzSCClakoSu1qwEhFOF1M2hPfL9T7cBa2XX7p8d5XiCBitC9jPnbMsTiNA7DFx3dTRmeUgzOKXKx31BIgKtbnVaVCeHEtByz636ipoTAz-toCqLvlmIE3VZ32FPwNRPJZb4hmzVPeP-In3rrVfE_-VfRWX',
    },
    {
      title: 'Hambúrguer de Frango Artesanal',
      category: 'Lanche',
      image:
        'https://images.unsplash.com/photo-1606756790138-9f874d4d9a5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Bolo de Chocolate Cremoso',
      category: 'Sobremesa',
      image:
        'https://images.unsplash.com/photo-1605478901652-cfbb5e7df6c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  featureCards: FeatureCard[] = [
    {
      tagText: 'Semana de 15 a 21 de Julho',
      cardColor: 'green',
      title: 'Cardápio da Semana',
      description: 'Planeje suas refeições com antecedência e economize tempo.',
      linkUrl: '/cardapios',
      linkText: 'Ver Cardápio',
      linkIcon: 'arrow_forward',
    },
    {
      tagText: 'Lista para 22 de Julho',
      cardColor: 'blue',
      title: 'Próxima Lista de Compras',
      description: 'Verifique os itens que você precisa para a próxima semana.',
      linkUrl: '/compras',
      linkText: 'Ver Lista',
      linkIcon: 'list_alt',
    },
    {
      tagText: 'Atualizado em 14 de Julho',
      cardColor: 'yellow',
      title: 'Status do Estoque',
      description: 'Mantenha o controle dos seus ingredientes e evite desperdícios.',
      linkUrl: '/estoque',
      linkText: 'Ver Estoque',
      linkIcon: 'inventory',
    },
  ];
}
