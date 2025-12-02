import {IngredientCreateRequest, IngredientResponse, Unit} from '../models/ingredient.model';

export interface IngredientFormData {
  id?: string;
  name: string;
  category?: string;
  defaultUnit?: Unit;
  conversions?: { toUnit: Unit; factor: number }[];
}

export const IngredientMapper = {
  /** Converte resposta da API → dados para preencher o modal */
  toFormData(api: IngredientResponse): IngredientFormData {
    return {
      id: api.id,
      name: api.name,
      category: api.category?.id,
      defaultUnit: api.defaultUnit,
      conversions: api.conversions?.map(c => ({
        toUnit: c.toUnit,
        factor: c.factor
      })) ?? []
    };
  },

  /** Converte dados do formulário → payload para acriar/editar ingrediente */
  toApiPayload(form: IngredientFormData): IngredientCreateRequest {
    return {
      name: form.name,
      category: form.category ?? '' ,
      defaultUnit: form.defaultUnit!,
      conversions: (form.conversions ?? []).map(c => ({
        toUnit: c.toUnit,
        factor: c.factor
      }))
    };
  }
};
