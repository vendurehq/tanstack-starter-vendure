import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	ScriptOnce,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/config/metadata";
import { m } from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime";
import { Link } from "@/platform/tanstack/navigation";
import { LocaleLayout } from "@/site/locale-layout";
import { themeScript } from "@/site/providers/theme-provider";
import { getShellData } from "@/site/shell.functions";
import appCss from "../storefront.css?url";

export const Route = createRootRoute({
	loader: () => getShellData(),
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: SITE_NAME,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	notFoundComponent: StorefrontNotFound,
	errorComponent: StorefrontError,
	shellComponent: RootDocument,
});

function StorefrontNotFound() {
	return (
		<main className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-4xl font-bold">{m.NotFound_title()}</h1>
			<p className="text-muted-foreground">{m.NotFound_message()}</p>
			<Button render={<Link href="/" />} nativeButton={false}>
				{m.NotFound_goHome()}
			</Button>
		</main>
	);
}

function StorefrontError({ error }: { error: Error }) {
	const router = useRouter();

	return (
		<main className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-3xl font-bold">Something went wrong</h1>
			<p className="text-muted-foreground">{error.message}</p>
			<Button onClick={() => router.invalidate()}>Try again</Button>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang={getLocale()}
			data-scroll-behavior="smooth"
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col antialiased">
				<ScriptOnce>{themeScript}</ScriptOnce>
				<LocaleLayout>{children}</LocaleLayout>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
