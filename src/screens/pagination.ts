export type PaginationPayload<T> = {
    rows: T[];
    total?: number;
    page?: number;
    totalPages?: number;
};

type PaginationMeta = {
    total?: number;
    page?: number;
    totalPages?: number;
};

function hasRows<T>(data: unknown): data is PaginationPayload<T> {
    return typeof data === "object" && data !== null && Array.isArray((data as PaginationPayload<T>).rows);
}

function calculateTotalPages(total: number, limit: number) {
    return Math.max(1, Math.ceil(total / limit));
}

export function normalizePagination<T>(
    data: T[] | PaginationPayload<T> | undefined,
    meta: PaginationMeta,
    requestedPage: number,
    requestedLimit: number
) {
    if (hasRows<T>(data)) {
        const total = data.total ?? data.rows.length;

        return {
            rows: data.rows,
            total,
            page: data.page ?? requestedPage,
            totalPages: data.totalPages ?? calculateTotalPages(total, requestedLimit),
            serverPaginated: true,
        };
    }

    if (Array.isArray(data)) {
        const serverPaginated = meta.total !== undefined || meta.page !== undefined || meta.totalPages !== undefined;
        const total = meta.total ?? data.length;

        return {
            rows: data,
            total,
            page: meta.page ?? requestedPage,
            totalPages: meta.totalPages ?? calculateTotalPages(total, requestedLimit),
            serverPaginated,
        };
    }

    return {
        rows: [],
        total: 0,
        page: requestedPage,
        totalPages: 1,
        serverPaginated: false,
    };
}

export function paginateRows<T>(rows: T[], page: number, limit: number, serverPaginated: boolean) {
    if (serverPaginated) return rows;

    const start = (page - 1) * limit;
    return rows.slice(start, start + limit);
}

export function getPaginationRange(total: number, page: number, limit: number) {
    return {
        first: total === 0 ? 0 : (page - 1) * limit + 1,
        last: Math.min(page * limit, total),
    };
}
