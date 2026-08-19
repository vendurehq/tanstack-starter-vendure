import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/config/metadata";
import { locales } from "@/paraglide/runtime";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(
					[
						"User-agent: *",
						"Allow: /",
						...locales.flatMap((locale) => [
							`Disallow: /${locale}/account`,
							`Disallow: /${locale}/checkout`,
						]),
						`Sitemap: ${new URL("/sitemap.xml", SITE_URL).href}`,
					].join("\n"),
					{
						headers: {
							"Cache-Control": "public, max-age=3600",
							"Content-Type": "text/plain; charset=utf-8",
						},
					},
				),
		},
	},
});
