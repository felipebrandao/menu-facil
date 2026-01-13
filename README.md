# MenuFácil

Aplicação web em **Angular** para organizar **receitas**, **cronograma/planejamento (semanal e mensal)** e cadastros auxiliares (ingredientes, unidades e categorias).

## Stack (principais)

- Angular **19** (standalone components + Angular Router)
- Angular Material + CDK
- TailwindCSS (plugins: `@tailwindcss/forms` e `@tailwindcss/typography`)
- RxJS
- Utilitários: `date-fns` e `swiper`

## Requisitos

- Node.js (LTS recomendado)
- npm

## Como rodar (desenvolvimento)

1) Instale as dependências:

```bash
npm install
```

2) Suba a aplicação:

```bash
npm start
```

O script `start` executa `ng serve` e já aplica o proxy via `proxy.conf.json`.

### Proxy / API (desenvolvimento)

Durante o desenvolvimento, requisições para **`/api`** são redirecionadas para:

- `http://localhost:8100`

Configuração em `proxy.conf.json`.

## Scripts

Definidos em `package.json`:

- `npm start`: `ng serve --proxy-config proxy.conf.json`
- `npm run build`: build (configuração padrão: **production**)
- `npm run watch`: build em modo watch usando **development** (`--configuration development`)
- `npm test`: testes via Karma

## Build

```bash
npm run build
```

Artefatos gerados em `dist/menu-facil`.

## Testes

```bash
npm test
```

## Ambientes

Arquivos em `src/environments/`:

- `environment.ts` (arquivo base, substituído via *file replacements*)
- `environment.development.ts`
  - `production: false`
  - `apiUrl: http://localhost:8100`
- `environment.production.ts`
  - `production: true`
  - `apiUrl: https://menufacil-d5cq.onrender.com`

Os *file replacements* ficam em `angular.json`:

- `build:development` troca `environment.ts` → `environment.development.ts`
- `build:production` troca `environment.ts` → `environment.production.ts`

> Observação: além do `apiUrl`, o projeto também configura proxy para `/api` durante o `npm start`.

## Arquitetura (Angular)

- Bootstrap via `bootstrapApplication` em `src/main.ts`.
- Providers principais em `src/app/app.config.ts`:
  - `provideRouter(routes)`
  - `provideHttpClient()`

## Rotas

Definidas em `src/app/app.routes.ts`:

- `/dashboard`
- `/my-recipes`
- `/recipes/new`
- `/recipes/edit/:id`
- `/recipes/:id`
- `/schedule`
- `/settings/profile`
- `/settings/ingredient-categories`
- `/settings/units`
- `/settings/ingredients`
- `/settings/recipe-categories`

`/` redireciona para `/dashboard` e qualquer rota desconhecida (`**`) volta para `/dashboard`.

## Estrutura de pastas (resumo)

- `src/app/core/`
  - componentes de layout (header/footer/layout)
- `src/app/features/`
  - **dashboard**: tela inicial
  - **recipe**: páginas de receitas (lista, criação/edição e visualização)
  - **schedule**: cronograma/planejamento (visões semanal e mensal)
  - **settings**: páginas de cadastro (perfil, categorias, unidades, ingredientes, categorias de receita)
- `src/app/shared/`
  - componentes reutilizáveis (modais, cards, skeleton, autocomplete)
  - `models/`, `mappers/`, `pipes/` e `services/`

## Serviços (HTTP)

Serviços compartilhados em `src/app/shared/services/`:

- `ingredient.service.ts`
- `categories-ingredient.service.ts`
- `recipe-category.service.ts`
- `recipe.service.ts`
- `unit.service.ts`

Também existem serviços específicos por feature em `src/app/features/**/services/`.

## UI / Estilos

- Tailwind configurado em `tailwind.config.js`.
- PostCSS em `postcss.config.js`.
- CSS global em `src/styles.css` (inclui imports de Google Fonts + Material Icons/Symbols).
- Modo escuro via `darkMode: 'class'`.
