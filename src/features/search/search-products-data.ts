import type { SearchProductsQuery } from "@/features/search/graphql";
import type { ResultOf } from "@/platform/vendure/graphql";

export interface SearchProductsData {
	data: ResultOf<typeof SearchProductsQuery>;
	token?: string;
}
