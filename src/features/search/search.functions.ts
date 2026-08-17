import { createServerFn } from "@tanstack/react-start";
import { getActiveCurrencyCodeOnServer } from "@/features/currency/active-currency.server";
import { getLocale } from "@/paraglide/runtime";
import { catalogSearchSchema } from "@/platform/tanstack/search";
import { queryOnServer } from "@/platform/vendure/api.server";
import { SearchProductsQuery } from "./graphql";
import { buildSearchInput } from "./search-helpers";

export const getSearchPageData = createServerFn({ method: "GET" })
	.validator(catalogSearchSchema)
	.handler(async ({ data }) => {
		const locale = getLocale();
		const currencyCode = await getActiveCurrencyCodeOnServer();

		const result = await queryOnServer(
			SearchProductsQuery,
			{ input: buildSearchInput({ searchParams: data }) },
			{ languageCode: locale, currencyCode },
		);
		// Only expose the query data; the raw result may carry a session token
		return { data: result.data, currencyCode };
	});
