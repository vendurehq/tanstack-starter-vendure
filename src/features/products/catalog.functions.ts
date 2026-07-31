import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { truncateDescription } from "@/config/metadata";
import { GetCollectionProductsQuery } from "@/features/collections/graphql";
import { getActiveCurrencyCodeOnServer } from "@/features/currency/active-currency.server";
import { getLocale } from "@/paraglide/runtime";
import { cachedPublicData } from "@/platform/cache/public-cache";
import { queryOnServer } from "@/platform/vendure/api.server";
import { readFragment } from "@/platform/vendure/graphql";
import { GetProductDetailQuery, ProductCardFragment } from "./graphql";
import { getDisplayOptionGroups } from "./product-options";

export const getRelatedProducts = createServerFn({ method: "GET" })
	.validator(
		z.object({
			collectionSlug: z.string().min(1),
			currentProductId: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		const locale = getLocale();
		const currencyCode = await getActiveCurrencyCodeOnServer();
		const items = await cachedPublicData({
			key: `related-products:${data.collectionSlug}:${locale}:${currencyCode}`,
			tags: [
				`related-products-${data.collectionSlug}-${locale}-${currencyCode}`,
			],
			ttlMs: 60 * 60 * 1000,
			load: async () => {
				const result = await queryOnServer(
					GetCollectionProductsQuery,
					{
						slug: data.collectionSlug,
						input: {
							collectionSlug: data.collectionSlug,
							take: 13,
							skip: 0,
							groupByProduct: true,
						},
					},
					{ languageCode: locale, currencyCode },
				);
				return result.data.search.items;
			},
		});

		return items
			.filter(
				(item) =>
					readFragment(ProductCardFragment, item).productId !==
					data.currentProductId,
			)
			.slice(0, 12);
	});

export const getProductPageData = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const locale = getLocale();
		const currencyCode = await getActiveCurrencyCodeOnServer();
		const result = await cachedPublicData({
			key: `product:detail:${data.slug}:${locale}:${currencyCode}`,
			tags: [`product-${data.slug}-${locale}-${currencyCode}`],
			ttlMs: 60 * 60 * 1000,
			load: async () =>
				(
					await queryOnServer(
						GetProductDetailQuery,
						{ slug: data.slug },
						{ languageCode: locale, currencyCode },
					)
				).data,
		});
		const product = result.product;
		if (!product) return null;

		const primaryCollection =
			product.collections?.find((collection) => collection.parent?.id) ??
			product.collections?.[0];
		return {
			metadata: {
				title: product.name,
				description: truncateDescription(product.description),
				path: `/product/${product.slug}`,
				image: product.assets?.[0]?.preview ?? null,
			},
			data: {
				product,
				primaryCollection,
				productForDisplay: {
					...product,
					optionGroups: getDisplayOptionGroups(product),
				},
				currencyCode,
			},
		};
	});
