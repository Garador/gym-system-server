import { SORT_OPTIONS } from '../enums/Database';

export interface SearchPaging {
  search(): void,
    isSorted: boolean,
    pagingOptions: PagingOptions,
    STEP_SIZE: number,
    searchPagingComponent: object;
}

export interface SearchOption {
  title: string,
    value: any
}

export interface SortOptions {
  [index: string]: {
    field: string,
    order: SORT_OPTIONS,
    active: boolean,
    fieldOrder: {
      [index: string]: SORT_OPTIONS
    }
  }
}
export interface PagingOptions {
  limit: number,
    offset: number
}
