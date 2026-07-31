import {
	Link as RouterLink,
	useNavigate,
	useRouter as useTanStackRouter,
	useRouterState,
} from "@tanstack/react-router";
import type { ComponentProps } from "react";

type LocalizedLinkProps = Omit<ComponentProps<"a">, "href"> & {
	href: string;
	locale?: string;
};

export function Link({ href, locale: _locale, ...props }: LocalizedLinkProps) {
	return <RouterLink to={href} {...props} />;
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
