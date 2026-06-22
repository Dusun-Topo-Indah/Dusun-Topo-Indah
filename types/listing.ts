export interface ListingQueryParams {
  q: string;
  filter: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  startIndex: number;
  endIndex: number;
}

