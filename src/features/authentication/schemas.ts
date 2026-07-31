import { z } from "zod";

const optionalProfileValue = z
	.string()
	.trim()
	.optional()
	.transform((value) => value || undefined);

export const loginInputSchema = z.object({
	username: z.string().trim().pipe(z.email()),
	password: z.string().min(1),
	redirectTo: z.string().optional(),
});

export const registrationInputSchema = z.object({
	emailAddress: z.string().trim().pipe(z.email()),
	firstName: optionalProfileValue,
	lastName: optionalProfileValue,
	phoneNumber: optionalProfileValue,
	password: z.string().min(8),
	redirectTo: z.string().optional(),
});

export const passwordResetRequestInputSchema = z.object({
	emailAddress: z.string().trim().pipe(z.email()),
});

export const passwordResetInputSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8),
	confirmPassword: z.string().min(8),
});

export const verificationInputSchema = z.object({
	token: z.string().min(1),
	password: z.string().optional(),
});
