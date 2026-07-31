type RouteParams<Path extends string> =
	Path extends `${string}/[${infer Param}]/${infer Rest}`
		? { [Key in Param | keyof RouteParams<`/${Rest}`>]: string }
		: Path extends `${string}/[${infer Param}]`
			? { [Key in Param]: string }
			: Record<string, never>;

declare global {
	type PageProps<Path extends string> = {
		params: Promise<RouteParams<Path>>;
		searchParams: Promise<Record<string, string | string[] | undefined>>;
	};
	type LayoutProps<Path extends string> = PageProps<Path> & {
		children: React.ReactNode;
	};
}

export {};
