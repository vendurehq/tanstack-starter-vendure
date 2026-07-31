export interface Metadata {
	title?: string | { default?: string; template?: string; absolute?: string };
	description?: string;
	metadataBase?: URL;
	robots?: Record<string, unknown>;
	openGraph?: Record<string, unknown>;
	twitter?: Record<string, unknown>;
	alternates?: Record<string, unknown>;
}

export interface Viewport {
	width?: string;
	initialScale?: number;
	maximumScale?: number;
	themeColor?: Array<{ media: string; color: string }>;
}
