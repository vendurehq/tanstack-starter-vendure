import { z } from "zod";
import {safeInternalRedirect} from './redirect.ts';

const optionalString = z.preprocess(
	(value) => (Array.isArray(value) ? value[0] : value),
	z.string().optional(),
);

const optionalRedirect = optionalString.transform((value) => {
	if (!value) return undefined;
	return safeInternalRedirect(value, '') || undefined;
});

export const redirectSearchSchema = z.object({ redirectTo: optionalRedirect });
export const tokenSearchSchema = z.object({
	token: optionalString,
	redirectTo: optionalRedirect,
});

export const catalogSortSchema = z.enum([
	"name-asc",
	"name-desc",
	"price-asc",
	"price-desc",
]);

export const catalogSearchSchema = z.object({
	q: optionalString.transform((value) => value?.trim() || undefined),
	page: z.coerce.number().int().positive().catch(1),
	sort: catalogSortSchema.catch("name-asc"),
	facets: z.preprocess((value) => {
		const values =
			value === undefined ? [] : Array.isArray(value) ? value : [value];
		return [
			...new Set(
				values
					// The router's search parser converts numeric-looking values to
					// numbers, and Vendure facet value IDs are numeric strings.
					.filter(
						(item): item is string | number =>
							typeof item === "string" || typeof item === "number",
					)
					.map((item) => String(item).trim())
					.filter(Boolean),
			),
		];
	}, z.array(z.string())),
});

export type CatalogSearch = z.infer<typeof catalogSearchSchema>;
export type CatalogSort = z.infer<typeof catalogSortSchema>;

export const productSearchSchema = z.record(z.string(), z.string().optional());
