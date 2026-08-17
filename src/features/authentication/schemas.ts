import { z } from "zod";

const optionalProfileValue = z
	.string()
	.trim()
	.optional()
	.transform((value) => value || undefined);

export function createLoginFormSchema(messages?: {
	emailValidation?: string;
	passwordRequired?: string;
}) {
	return z.object({
		username: z.string().trim().pipe(z.email(messages?.emailValidation)),
		password: z.string().min(1, messages?.passwordRequired),
	});
}

/** Client login form fields (no redirectTo). */
export const loginFormSchema = createLoginFormSchema();

export const loginInputSchema = loginFormSchema.extend({
	redirectTo: z.string().optional(),
});

/** Client registration form: same core rules as registrationInputSchema, plus confirmPassword. */
export function createRegistrationFormSchema(messages: {
	emailValidation: string;
	passwordMinLength: string;
	passwordsMismatch: string;
}) {
	return z
		.object({
			emailAddress: z.string().trim().pipe(z.email(messages.emailValidation)),
			firstName: z.string().optional(),
			lastName: z.string().optional(),
			phoneNumber: z.string().optional(),
			password: z.string().min(8, messages.passwordMinLength),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: messages.passwordsMismatch,
			path: ["confirmPassword"],
		});
}

export const registrationInputSchema = z.object({
	emailAddress: z.string().trim().pipe(z.email()),
	firstName: optionalProfileValue,
	lastName: optionalProfileValue,
	phoneNumber: optionalProfileValue,
	password: z.string().min(8),
	redirectTo: z.string().optional(),
});

export function createPasswordResetRequestFormSchema(emailValidation: string) {
	return z.object({
		emailAddress: z.string().trim().pipe(z.email(emailValidation)),
	});
}

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
