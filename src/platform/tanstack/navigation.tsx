import {
	Link as RouterLink,
	notFound as routerNotFound,
	redirect as routerRedirect,
	useNavigate,
	useRouter as useTanStackRouter,
	useRouterState,
} from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { localizeUrl } from "@/paraglide/runtime.js";

type LocalizedLinkProps = Omit<ComponentProps<"a">, "href"> & {
	href: string;
	locale?: string;
};

export function Link({ href, locale: _locale, ...props }: LocalizedLinkProps) {
	return <RouterLink to={href} {...props} />;
}

export function redirect({ href }: { href: string; locale?: string }): never {
	if (typeof window !== "undefined") {
		window.location.assign(localizeUrl(new URL(href, window.location.origin)).href);
	}
	throw routerRedirect({ href });
}

export function usePathname() {
	return useRouterState({ select: (state) => state.location.pathname });
}

export function useSearchParams() {
	const search = useRouterState({ select: (state) => state.location.searchStr });
	return new URLSearchParams(search);
}

export function useRouter() {
	const navigate = useNavigate();
	const router = useTanStackRouter();
	return {
		push: (href: string, _options?: { scroll?: boolean }) => navigate({ href }),
		replace: (href: string, options?: { locale?: string; scroll?: boolean }) => {
			if (options?.locale) {
				return import("@/paraglide/runtime.js").then(({ setLocale }) =>
					setLocale(options.locale as "en" | "de"),
				);
			}
			return navigate({ href, replace: true });
		},
		refresh: () => router.invalidate(),
	};
}

export function useSelectedLayoutSegment() {
	const pathname = usePathname();
	return pathname.split("/").filter(Boolean)[0] ?? null;
}

export function getPathname({ href }: { href: string; locale?: string }) {
	return href;
}

export function notFound(): never {
	throw routerNotFound();
}
