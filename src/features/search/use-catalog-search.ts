import { useNavigate } from "@tanstack/react-router";
import type { CatalogSearch } from "@/platform/tanstack/search";

type CatalogNavigate = (opts: {
	to: ".";
	search: (prev: CatalogSearch) => CatalogSearch;
}) => Promise<void>;

/**
 * Patch the catalog search params of the current route. Shared by /search and
 * /collection/$slug, which use the same search schema. Navigating to "."
 * cannot be statically typed across routes, hence the cast.
 */
export function useCatalogSearchNavigate() {
	const navigate = useNavigate() as unknown as CatalogNavigate;
	return (patch: Partial<CatalogSearch>) =>
		navigate({
			to: ".",
			search: (prev) => ({ ...prev, ...patch }),
		});
}
