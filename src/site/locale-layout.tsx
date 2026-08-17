import { getRouteApi } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/site/footer";
import { Navbar } from "@/site/navigation/navbar";
import { ThemeProvider } from "@/site/providers/theme-provider";

const rootRoute = getRouteApi("__root__");

export function LocaleLayout({ children }: { children: ReactNode }) {
	const shell = rootRoute.useLoaderData();
	return (
		<ThemeProvider>
			<Navbar
				collections={shell.collections}
				availableCurrencyCodes={shell.availableCurrencyCodes}
				activeCurrencyCode={shell.activeCurrencyCode}
				personalized={shell.personalized}
			/>
			{children}
			<Footer collections={shell.collections} />
			<Toaster />
		</ThemeProvider>
	);
}
