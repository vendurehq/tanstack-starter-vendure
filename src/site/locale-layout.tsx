import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/site/footer";
import { Navbar } from "@/site/navigation/navbar";
import { ThemeProvider } from "@/site/providers/theme-provider";
import type { ReactNode } from "react";
import { getRouteApi } from "@tanstack/react-router";

const rootRoute = getRouteApi('__root__');

export function LocaleLayout({ children }: { children: ReactNode }) {
	const shell = rootRoute.useLoaderData();
	return (
		<ThemeProvider>
			<Navbar data={shell} />
			{children}
			<Footer collections={shell.collections} />
			<Toaster />
		</ThemeProvider>
	);
}
