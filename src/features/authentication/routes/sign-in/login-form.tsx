import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createLoginFormSchema } from "@/features/authentication/schemas";
import { useTranslations } from "@/platform/i18n/paraglide";
import { loginAction } from "./actions";

interface LoginFormProps {
	redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
	const t = useTranslations("Auth");
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState<string | null>(null);
	const login = useServerFn(loginAction);

	const loginSchema = createLoginFormSchema({
		emailValidation: t("emailValidation"),
		passwordRequired: t("passwordRequired"),
	});
	type LoginFormData = z.infer<typeof loginSchema>;

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		setServerError(null);

		startTransition(async () => {
			const result = await login({ data: { ...data, redirectTo } });
			if (result?.error) {
				setServerError(result.error);
			} else {
				// Successful login redirected; reload cached loaders (navbar user, cart)
				await router.invalidate();
			}
		});
	};

	return (
		<Card>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("email")}</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="you@example.com"
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>{t("password")}</FormLabel>
										<Link
											to="/forgot-password"
											className="text-muted-foreground hover:text-primary text-sm"
										>
											{t("forgotPassword")}
										</Link>
									</div>

									<FormControl>
										<PasswordInput
											placeholder="••••••••"
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{serverError && (
							<div className="text-sm text-destructive">{serverError}</div>
						)}
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? t("signingIn") : t("signIn")}
						</Button>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4 mt-2">
						<div className="text-muted-foreground text-sm text-center">
							{t("noAccount")}{" "}
							<Link
								to="/register"
								search={{ redirectTo }}
								className="hover:text-primary underline"
							>
								{t("register")}
							</Link>
						</div>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
