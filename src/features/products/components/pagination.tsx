import {Link} from '@tanstack/react-router';
import {
    Pagination as PaginationNav,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {useTranslations} from '@/platform/i18n/paraglide';
import {getPageItems} from './pagination-items';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}
export function Pagination({currentPage, totalPages}: PaginationProps) {
    const t = useTranslations('Product');
    const pages = getPageItems(currentPage, totalPages);

    return (
        <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
                {t('pageOf', {current: currentPage, total: totalPages})}
            </p>
            <PaginationNav>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            text={t('previousPage')}
                            render={
                                currentPage > 1
                                    ? <Link to="." search={(previous) => ({...previous, page: currentPage - 1})} />
                                    : undefined
                            }
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <PaginationItem key={`ellipsis-${index}`} className="hidden sm:list-item">
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem
                                key={page}
                                className={page === currentPage ? undefined : 'hidden sm:list-item'}
                            >
                                <PaginationLink
                                    render={<Link to="." search={(previous) => ({...previous, page})} />}
                                    isActive={page === currentPage}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            text={t('nextPage')}
                            render={
                                currentPage < totalPages
                                    ? <Link to="." search={(previous) => ({...previous, page: currentPage + 1})} />
                                    : undefined
                            }
                            aria-disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </PaginationNav>
        </div>
    );
}
