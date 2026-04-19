export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | undefined>,
): Required<PaginationParams> {
  const read = (key: string): string | null | undefined =>
    searchParams instanceof URLSearchParams ? searchParams.get(key) : searchParams[key];

  const pageRaw = Number(read("page") ?? 1);
  const sizeRaw = Number(read("pageSize") ?? DEFAULT_PAGE_SIZE);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const pageSize =
    Number.isFinite(sizeRaw) && sizeRaw >= 1
      ? Math.min(Math.floor(sizeRaw), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  return { page, pageSize };
}

export function paginationRange({ page, pageSize }: Required<PaginationParams>): {
  from: number;
  to: number;
} {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  { page, pageSize }: Required<PaginationParams>,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
