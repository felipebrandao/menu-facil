import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import {
  ShoppingListResponse,
  ShoppingListService,
  ShoppingListView,
} from '../../services/shopping-list.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

type ShoppingListItem = {
  id: string;
  label: string;
  checked: boolean;
};

type ShoppingListCategory = {
  id: string;
  name: string;
  items: ShoppingListItem[];
};

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, RouterLink],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListComponent implements OnInit {
  view: ShoppingListView = 'weekly';

  currentDate = new Date();
  weekStart = this.startOfWeek(new Date());

  selectedRangeLabel = '';

  isLoading = false;
  errorMessage: string | null = null;

  response: ShoppingListResponse | null = null;

  categories: ShoppingListCategory[] = [];

  constructor(
    private readonly shoppingListService: ShoppingListService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refreshPeriod();
  }

  get isEmpty(): boolean {
    if (!this.response) return false;
    if (!this.categories.length) return true;
    return this.categories.every((c) => !c.items || c.items.length === 0);
  }

  setView(view: ShoppingListView): void {
    if (this.view === view) return;
    this.view = view;
    this.refreshPeriod();
  }

  prevPeriod(): void {
    if (this.view === 'weekly') {
      this.weekStart = this.addDays(this.weekStart, -7);
    } else {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );
    }
    this.refreshPeriod();
  }

  nextPeriod(): void {
    if (this.view === 'weekly') {
      this.weekStart = this.addDays(this.weekStart, 7);
    } else {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );
    }
    this.refreshPeriod();
  }

  private refreshPeriod(): void {
    if (this.view === 'weekly') {
      const end = this.addDays(this.weekStart, 6);
      this.selectedRangeLabel = `${this.formatLabel(this.weekStart)} → ${this.formatLabel(end)}`;
    } else {
      const y = this.currentDate.getFullYear();
      const m = this.currentDate.toLocaleString('pt-BR', { month: 'long' });
      this.selectedRangeLabel = `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
    }

    this.load();
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const requestParams =
      this.view === 'weekly'
        ? { view: 'weekly' as const, start: this.formatKey(this.weekStart) }
        : {
            view: 'monthly' as const,
            year: this.currentDate.getFullYear(),
            month: this.currentDate.getMonth() + 1,
          };

    this.shoppingListService
      .generate(requestParams)
      .pipe(
        catchError(() => {
          this.errorMessage = 'Não foi possível carregar a lista de compras.';
          return of<ShoppingListResponse>({
            view: this.view,
            start: requestParams.view === 'weekly' ? requestParams.start : '',
            end: '',
            categories: [],
          });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.response = res;
          this.categories = this.mapResponseToCategories(res);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private startOfWeek(d: Date): Date {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  }

  private addDays(d: Date, days: number): Date {
    const date = new Date(d);
    date.setDate(date.getDate() + days);
    return date;
  }

  private formatKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatLabel(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = d.toLocaleString('pt-BR', { month: 'long' });
    const month = mm.charAt(0).toUpperCase() + mm.slice(1);
    return `${dd} de ${month}`;
  }

  private mapResponseToCategories(res: ShoppingListResponse): ShoppingListCategory[] {
    return (res.categories ?? []).map((c) => {
      const name = (c.categoryName || '').trim();

      return {
        id: c.categoryId,
        name: name || 'Categoria',
        items: (c.items ?? []).map((i) => ({
          id: i.ingredientId,
          label: `${(i.ingredientName || '').trim()} (${this.formatQuantity(
            i.quantity,
            i.unitAbbreviation
          )})`,
          checked: false,
        })),
      };
    });
  }

  formatItemsCount(count: number): string {
    const n = Number(count ?? 0);
    return `${n} ${n === 1 ? 'item' : 'itens'}`;
  }

  private formatQuantity(quantity: number, unitAbbreviation: string): string {
    if (quantity == null) return '';
    const qNumber = Number(quantity);
    const q = Number.isFinite(qNumber)
      ? (Number.isInteger(qNumber) ? String(qNumber) : String(qNumber).replace('.', ','))
      : String(quantity);
    return unitAbbreviation ? `${q}${unitAbbreviation}` : q;
  }

  toggleItem(categoryId: string, itemId: string): void {
    this.categories = this.categories.map((c) => {
      if (c.id !== categoryId) return c;
      return {
        ...c,
        items: c.items.map((i) =>
          i.id === itemId ? { ...i, checked: !i.checked } : i
        ),
      };
    });
  }

  exportPdf(): void {
    console.log('Exportar PDF');
  }

  exportExcel(): void {
    console.log('Exportar Excel');
  }

  sendToApp(): void {
    console.log('Enviar para App');
  }
}
