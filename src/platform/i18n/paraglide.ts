import { m } from "@/paraglide/messages.js";
import {
	getLocale as getParaglideLocale,
	setLocale,
	type Locale,
} from "@/paraglide/runtime.js";

type MessageInputs = Record<string, string | number | Date>;
type MessageFunction = (inputs?: MessageInputs) => string;

function translator(namespace: string) {
	return (key: string, inputs?: MessageInputs) => {
		const message = (m as unknown as Record<string, MessageFunction>)[
			`${namespace}_${key.replaceAll(".", "_")}`
		];
		if (!message) {
			throw new Error(`Unknown message: ${namespace}.${key}`);
		}
		return message(inputs);
	};
}

export function useTranslations<Namespace extends string>(namespace: Namespace) {
	return translator(namespace);
}

export function getTranslations<Namespace extends string>(
	input: Namespace | { locale?: string; namespace: Namespace },
) {
	return translator(typeof input === "string" ? input : input.namespace);
}

export function getLocale(): Locale {
	return getParaglideLocale();
}

export function useLocale(): Locale {
	return getParaglideLocale();
}

export function hasLocale(
	locales: readonly string[],
	value: string | undefined,
): value is Locale {
	return value !== undefined && locales.includes(value);
}

export { setLocale };
export type { Locale };
