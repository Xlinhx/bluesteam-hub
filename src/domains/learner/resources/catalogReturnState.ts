import type { ResourceDto } from '../../../shared/api/catalog';
import type { ResourceGroup } from '../../../shared/api/resourceGroups';

export interface CatalogReturnState {
  key: string;
  groups: ResourceGroup[];
  focusedGroup: ResourceGroup | null;
  groupTotal: number;
  items: ResourceDto[];
  cursor: string | null;
  total: number;
  scrollY: number;
  history?: Array<string | undefined>;
}
let returnState: CatalogReturnState | null = null;

export function rememberCatalog(state: CatalogReturnState) { returnState = state; }
export function peekCatalogReturn(key: string): CatalogReturnState | null {
  return returnState?.key === key ? returnState : null;
}
export function takeCatalogReturn(key: string): CatalogReturnState | null {
  const state = returnState;
  returnState = null;
  return state?.key === key ? state : null;
}
