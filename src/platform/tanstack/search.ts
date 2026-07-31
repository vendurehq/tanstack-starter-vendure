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
export const catalogSearchSchema = z.object({
	q: optionalString,
	page: z.coerce.number().int().positive().catch(1),
	sort: optionalString,
	facets: z.preprocess(
		(value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
		z.array(z.string()),
	),
});
export const productSearchSchema = z.record(z.string(), z.string().optional());
