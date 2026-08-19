/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SITE_NAME?: string;
	readonly VITE_SITE_URL?: string;
	readonly VITE_VERCEL_PROJECT_PRODUCTION_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
