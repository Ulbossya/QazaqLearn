"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePagination = normalizePagination;
exports.paginated = paginated;
function normalizePagination(query) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;
    const order = query.order === "asc" ? "asc" : "desc";
    return { page, limit, skip, order };
}
function paginated(items, total, page, limit) {
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
//# sourceMappingURL=pagination.js.map