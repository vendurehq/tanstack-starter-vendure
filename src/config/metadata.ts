export const SITE_NAME = import.meta.env.VITE_SITE_NAME || "Vendure Store";

const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
if (import.meta.env.PROD && !configuredSiteUrl) {
	throw new Error("VITE_SITE_URL is required for production builds");
}

export const SITE_URL = configuredSiteUrl || "http://localhost:3000";
export const DEFAULT_OG_IMAGE = new URL("/og-image.jpg", SITE_URL).href;

/**
 * Truncate text to a maximum length while preserving word boundaries.
 * Strips HTML tags and is ideal for meta descriptions (recommended 150-160 chars).
 */
export function truncateDescription(
	text: string | null | undefined,
	maxLength = 155,
): string {
	if (!text) return "";

	// Strip HTML tags if present
	const cleanText = text.replace(/<[^>]*>/g, "").trim();

	if (cleanText.length <= maxLength) return cleanText;

	// Find the last space before maxLength to avoid cutting words
	const truncated = cleanText.substring(0, maxLength);
	const lastSpaceIndex = truncated.lastIndexOf(" ");

	return lastSpaceIndex > 0
		? `${truncated.substring(0, lastSpaceIndex)}...`
		: `${truncated}...`;
}
