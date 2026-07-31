import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { truncateDescription } from "@/config/metadata";
import { getActiveCurrencyCodeOnServer } from "@/features/currency/active-currency.server";
import { buildSearchInput } from "@/features/search/search-helpers";
import { getLocale } from "@/paraglide/runtime";
import { catalogSearchSchema } from "@/platform/tanstack/search";
import { queryOnServer } from "@/platform/vendure/api.server";
import { GetCollectionPageQuery } from "./graphql";

const collectionPageSchema = catalogSearchSchema.extend({
	slug: z.string().min(1),
});

export const getCollectionPageData = createServerFn({ method: "GET" })
	.validator(collectionPageSchema)
	.handler(async ({ data }) => {
		const locale = getLocale();
		const currencyCode = await getActiveCurrencyCodeOnServer();
		const productData = await queryOnServer(
			GetCollectionPageQuery,
			{
				slug: data.slug,
				input: buildSearchInput({
					searchParams: data,
					collectionSlug: data.slug,
				}),
			},
			{ languageCode: locale, currencyCode },
		);
		const collection = productData.data.collection;
		if (!collection) return null;

		return {
			metadata: {
				title: collection.name,
				description: truncateDescription(collection.description),
				path: `/collection/${collection.slug}`,
				image: collection.featuredAsset?.preview ?? null,
			},
			productData,
		};
	});
