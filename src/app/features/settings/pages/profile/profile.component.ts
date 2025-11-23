import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  user = {
    name: 'Vivian Brandão',
    email: 'vivian.brandao@email.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTLLb7T3Ff-vHf_ITJVJ5jddGN02v_8-RFdGLSkF-IM9oKRaJBOM-vYsGwqzRiemFgnvWl5U0oPrtmjO1A290XJwjVqVaLU9Ip3QOEQ6gciNH1QQz5cEIoYr-IFwzulk1SJnZQcwF9-PmVEIFw5vJG96NsyAheRO8S2v1ZtEHlTHFt9nU7ubXF0By9vef_U3ySRStV98c90Zzzk04K-KHiWgmhtquny54vMwO6FiCp2jfKLith3gDN8cujLWmN3TVAY8yiXYyPBLU'
  };

  managementItems = [
    {
      icon: 'sell',
      title: 'Cadastro de Categoria de Ingrediente',
      description: 'Gerencie categorias para organizar seus ingredientes.',
      link: ['/settings', 'ingredient-categories']
    },
    {
      icon: 'scale',
      title: 'Cadastro de Tipo de Unidades',
      description: 'Crie e edite unidades de medida (g, xícaras, colheres).',
      link: ['/settings', 'units']
    },
    {
      icon: 'inventory_2',
      title: 'Cadastro de Ingrediente',
      description: 'Adicione, visualize e edite ingredientes.',
      link: ['/settings', 'ingredients']
    },
    {
      icon: 'category',
      title: 'Cadastro de Categoria de Receita',
      description: 'Gerencie categorias para organizar suas receitas.',
      link: ['/settings', 'recipe-categories']
    }
  ];
}
