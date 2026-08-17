import { Await } from "@tanstack/react-router";
import { Suspense } from "react";
import Image from "@/components/storefront-image";
import { Skeleton } from "@/components/ui/skeleton";
import { CartIcon } from "@/site/navigation/navbar/cart-icon";
import { CurrencyPicker } from "@/site/navigation/navbar/currency-picker";
import { LanguagePicker } from "@/site/navigation/navbar/language-picker";
import { MobileNav } from "@/site/navigation/navbar/mobile-nav";
import { NavbarCollections } from "@/site/navigation/navbar/navbar-collections";
import { NavbarUser } from "@/site/navigation/navbar/navbar-user";
import { ThemeSwitcher } from "@/site/navigation/navbar/theme-switcher";
import { NavigationLink } from "@/site/navigation/navigation-link";
import { SearchInput } from "@/site/navigation/search-input";
import { NavbarUserSkeleton } from "@/site/navigation/skeletons/navbar-user-skeleton";
import { SearchInputSkeleton } from "@/site/navigation/skeletons/search-input-skeleton";
import type { getPersonalizedShellData } from "@/site/shell.functions";

interface NavbarProps {
	collections: Array<{ id: string; name: string; slug: string }>;
	availableCurrencyCodes: string[];
	activeCurrencyCode: string;
	personalized: Promise<Awaited<ReturnType<typeof getPersonalizedShellData>>>;
}

export function Navbar({
	collections,
	availableCurrencyCodes,
	activeCurrencyCode,
	personalized,
}: NavbarProps) {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-background/80">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center gap-8">
						<Suspense>
							<MobileNav collections={collections} />
						</Suspense>
						<NavigationLink href="/" className="text-xl font-bold">
							<Image
								src="/vendure.svg"
								alt="Vendure"
								width={40}
								height={27}
								className="h-6 w-auto dark:invert"
							/>
						</NavigationLink>
						<nav className="hidden md:flex items-center gap-6">
							<Suspense>
								<NavbarCollections collections={collections} />
							</Suspense>
						</nav>
					</div>
					<div className="flex items-center gap-4">
						<div className="hidden lg:flex">
							<Suspense fallback={<SearchInputSkeleton />}>
								<SearchInput />
							</Suspense>
						</div>
						<Suspense>
							<LanguagePicker />
						</Suspense>
						<Suspense>
							<CurrencyPicker
								availableCurrencyCodes={availableCurrencyCodes}
								activeCurrencyCode={activeCurrencyCode}
							/>
						</Suspense>
						<Suspense>
							<ThemeSwitcher />
						</Suspense>
						<Await
							promise={personalized}
							fallback={<Skeleton className="h-9 w-9 rounded-md" />}
						>
							{(data) => <CartIcon cartItemCount={data.cartItemCount} />}
						</Await>
						<Await promise={personalized} fallback={<NavbarUserSkeleton />}>
							{(data) => <NavbarUser firstName={data.customerFirstName} />}
						</Await>
					</div>
				</div>
			</div>
		</header>
	);
}
