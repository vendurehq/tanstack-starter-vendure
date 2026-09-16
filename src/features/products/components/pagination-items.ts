export function getPageItems(currentPage: number, totalPages: number) {
    const pages: Array<number | 'ellipsis'> = [];
    let previousPage = 0;

    for (let page = 1; page <= totalPages; page++) {
        const isBoundary = page === 1 || page === totalPages;
        const isNearCurrentPage = page >= currentPage - 1 && page <= currentPage + 1;

        if (!isBoundary && !isNearCurrentPage) continue;

        if (previousPage && page - previousPage > 1) pages.push('ellipsis');
        pages.push(page);
        previousPage = page;
    }

    return pages;
}
