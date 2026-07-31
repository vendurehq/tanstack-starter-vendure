import { z } from "zod";

const optionalString = z.preprocess(
	(value) => (Array.isArray(value) ? value[0] : value),
	z.string().optional(),
);

export const redirectSearchSchema = z.object({ redirectTo: optionalString });
export const tokenSearchSchema = z.object({
	token: optionalString,
	redirectTo: optionalString,
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
					.filter((item): item is string => typeof item === "string")
					.map((item) => item.trim())
					.filter(Boolean),
			),
		];
	}, z.array(z.string())),
});

export type CatalogSearch = z.infer<typeof catalogSearchSchema>;
export type CatalogSort = z.infer<typeof catalogSortSchema>;

export const productSearchSchema = z.record(z.string(), z.string().optional());
