import { useTranslations } from "@/platform/i18n/paraglide";

interface SearchTermProps {
	searchParams: { q?: string };
}

export function SearchTerm({ searchParams }: SearchTermProps) {
	const searchTerm = searchParams.q || "";
	const t = useTranslations("Search");

	return (
		<div className="mb-6">
			<h1 className="text-3xl font-bold">
				{searchTerm ? t("resultsFor", { query: searchTerm }) : t("title")}
			</h1>
		</div>
	);
}

export function SearchTermSkeleton() {
	return (
		<div className="mb-6">
			<div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
		</div>
	);
}
