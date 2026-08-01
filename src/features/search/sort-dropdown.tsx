import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {useCatalogSearchNavigate} from '@/features/search/use-catalog-search';
import {useTranslations} from '@/platform/i18n/paraglide';
import {type CatalogSort, catalogSortSchema} from '@/platform/tanstack/search';

export function SortDropdown({currentSort}: {currentSort: CatalogSort}) {
    const t = useTranslations('Sort');
    const navigateCatalogSearch = useCatalogSearchNavigate();

    const sortOptions = [
        {value: 'name-asc', label: t('nameAsc')},
        {value: 'name-desc', label: t('nameDesc')},
        {value: 'price-asc', label: t('priceAsc')},
        {value: 'price-desc', label: t('priceDesc')},
    ];

    const handleSortChange = (value: string | null) => {
        const sort = catalogSortSchema.safeParse(value);
        if (!sort.success) return;
        // Reset to page 1 when sort changes
        navigateCatalogSearch({sort: sort.data, page: 1});
    };

    return (
        <Select value={currentSort} onValueChange={handleSortChange} items={sortOptions}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('placeholder')}/>
            </SelectTrigger>
            <SelectContent>
                {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
