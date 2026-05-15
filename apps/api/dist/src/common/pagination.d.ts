export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
}
export declare function normalizePagination(query: PaginationQuery): {
    page: number;
    limit: number;
    skip: number;
    order: "asc" | "desc";
};
export declare function paginated<T>(items: T[], total: number, page: number, limit: number): {
    items: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};
