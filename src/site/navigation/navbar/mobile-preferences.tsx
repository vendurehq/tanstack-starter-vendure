import { useServerFn } from "@tanstack/react-start";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useTransition } from "react";
import { switchCurrency } from "@/features/currency/switch-currency.functions";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/platform/i18n/paraglide";
import { localeNames, routing } from "@/platform/i18n/routing";
import { usePathname, useRouter } from "@/platform/tanstack/navigation";
import { type Theme, useTheme } from "@/site/providers/theme-provider";

interface MobilePreferencesProps {
	availableCurrencyCodes: string[];
	activeCurrencyCode: string;
}

/**
 * Language, currency and theme controls for the mobile drawer.
 *
 * The header has no room for these controls at portrait widths, so they render
 * here as flat option rows instead of dropdowns: every row is a 44px touch
 * target and stays readable without opening a second overlay.
 */
export function MobilePreferences({
	availableCurrencyCodes,
	activeCurrencyCode,
}: MobilePreferencesProps) {
	const t = useTranslations("Navigation");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [isPending, startTransition] = useTransition();
	const changeCurrency = useServerFn(switchCurrency);

	const currencyNames = useMemo(
		() => new Intl.DisplayNames([locale], { type: "currency" }),
		[locale],
	);

	const themeOptions: Array<{ value: Theme; label: string; icon: ReactNode }> =
		[
			{
				value: "light",
				label: t("themeLight"),
				icon: <Sun className="size-4" />,
			},
			{
				value: "dark",
				label: t("themeDark"),
				icon: <Moon className="size-4" />,
			},
			{
				value: "system",
				label: t("themeSystem"),
				icon: <Monitor className="size-4" />,
			},
		];

	const handleCurrencyChange = (currencyCode: string) => {
		startTransition(async () => {
			await changeCurrency({ data: { currencyCode } });
			router.refresh();
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<PreferenceGroup label={t("language")}>
				{routing.locales.map((candidate) => (
					<PreferenceOption
						key={candidate}
						name="mobile-language"
						code={candidate.toUpperCase()}
						label={localeNames[candidate] ?? candidate.toUpperCase()}
						selected={candidate === locale}
						onSelect={() => router.replace(pathname, { locale: candidate })}
					/>
				))}
			</PreferenceGroup>

			{availableCurrencyCodes.length > 1 && (
				<PreferenceGroup label={t("currency")}>
					{availableCurrencyCodes.map((code) => (
						<PreferenceOption
							key={code}
							name="mobile-currency"
							code={code}
							label={currencyNames.of(code) ?? code}
							selected={code === activeCurrencyCode}
							disabled={isPending}
							onSelect={() => handleCurrencyChange(code)}
						/>
					))}
				</PreferenceGroup>
			)}

			<PreferenceGroup label={t("theme")}>
				{themeOptions.map((option) => (
					<PreferenceOption
						key={option.value}
						name="mobile-theme"
						icon={option.icon}
						label={option.label}
						selected={theme === option.value}
						onSelect={() => setTheme(option.value)}
					/>
				))}
			</PreferenceGroup>
		</div>
	);
}

function PreferenceGroup({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<fieldset className="min-w-0">
			<legend className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</legend>
			<div className="flex flex-col gap-0.5">{children}</div>
		</fieldset>
	);
}

/**
 * A native radio keeps keyboard and screen reader semantics; the label carries
 * the visuals and the 44px touch target.
 */
function PreferenceOption({
	name,
	code,
	icon,
	label,
	selected,
	disabled,
	onSelect,
}: {
	name: string;
	code?: string;
	icon?: ReactNode;
	label: string;
	selected: boolean;
	disabled?: boolean;
	onSelect: () => void;
}) {
	return (
		<label
			className={cn(
				"flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
				"has-[:checked]:bg-accent has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50",
				"has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
			)}
		>
			<input
				type="radio"
				name={name}
				className="sr-only"
				checked={selected}
				disabled={disabled}
				onChange={onSelect}
			/>
			{code ? (
				<span className="w-8 shrink-0 text-xs font-semibold tracking-wider text-muted-foreground">
					{code}
				</span>
			) : (
				icon
			)}
			<span className="truncate">{label}</span>
			{selected && <Check className="ml-auto size-4 shrink-0" />}
		</label>
	);
}
