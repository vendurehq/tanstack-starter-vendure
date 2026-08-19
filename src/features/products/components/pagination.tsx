import {Link} from '@tanstack/react-router';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}
export function Pagination({currentPage, totalPages}: PaginationProps) {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        let prev = 0;
        for (const i of range) {
            if (prev && i - prev > 1) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            prev = i;
        }

        return rangeWithDots;
    };

    const pages = getPageNumbers();

    return (
        <nav className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                render={currentPage !== 1 ? <Link to="." search={(previous) => ({...previous, page: currentPage - 1})} /> : undefined}
                nativeButton={currentPage !== 1 ? false : undefined}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4"/>
            </Button>

            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                    <Button
                        key={pageNum}
                        variant={isActive ? 'default' : 'outline'}
                        size="icon"
                        className="rounded-full"
                        render={!isActive ? <Link to="." search={(previous) => ({...previous, page: pageNum})} /> : undefined}
                        nativeButton={!isActive ? false : undefined}
                        disabled={isActive}
                    >
                        {pageNum}
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                render={currentPage !== totalPages ? <Link to="." search={(previous) => ({...previous, page: currentPage + 1})} /> : undefined}
                nativeButton={currentPage !== totalPages ? false : undefined}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4"/>
            </Button>
        </nav>
    );
}
