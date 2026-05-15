export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export function normalizePagination(query: PaginationQuery) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const order: "asc" | "desc" = query.order === "asc" ? "asc" : "desc";
  return { page, limit, skip, order };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
