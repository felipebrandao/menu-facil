import { IngredientCreateRequest, IngredientResponse } from '../models/ingredient.model';

export interface IngredientFormData {
  id?: string;
  name: string;
  category?: string;
  unit?: string;
  conversions?: { toUnit: string; factor: number }[];
}

export const IngredientMapper = {
  /** Converte resposta da API → dados para preencher o modal */
  toFormData(api: IngredientResponse): IngredientFormData {
    return {
      id: api.id,
      name: api.name,
      category: api.category?.id,
      unit: api.defaultUnit?.id,
      conversions: api.conversions?.map(c => ({
        toUnit: c.toUnit.id,
        factor: c.factor
      })) ?? []
    };
  },

  /** Converte dados do formulário → payload para criar/editar ingrediente */
  toApiPayload(form: IngredientFormData): IngredientCreateRequest {
    return {
      name: form.name,
      category: { id: form.category ?? '' },
      defaultUnit: { id: form.unit ?? '' },
      conversions: (form.conversions ?? []).map(c => ({
        toUnit: { id: c.toUnit },
        factor: c.factor
      }))
    };
  }
};
