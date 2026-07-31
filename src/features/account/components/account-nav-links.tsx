"use client";

import { Link } from "@tanstack/react-router";
import { MapPin, Package, User } from "lucide-react";
import { useTranslations } from "@/platform/i18n/paraglide";

const navItems = [
	{ to: "/account/orders", labelKey: "orders", Icon: Package },
	{ to: "/account/addresses", labelKey: "addresses", Icon: MapPin },
	{ to: "/account/profile", labelKey: "profile", Icon: User },
] as const;

interface AccountNavLinksProps {
	layout: "horizontal" | "vertical";
}

export function AccountNavLinks({ layout }: AccountNavLinksProps) {
	const t = useTranslations("Account");

	if (layout === "horizontal") {
		return (
			<nav className="flex gap-1 overflow-x-auto border-b border-border pb-px">
				{navItems.map(({ to, labelKey, Icon }) => {
					return (
						<Link
							key={to}
							to={to}
							activeOptions={{ includeSearch: false }}
							className="flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
							activeProps={{ className: "border-primary text-foreground" }}
							inactiveProps={{
								className:
									"border-transparent text-muted-foreground hover:text-foreground hover:border-border",
							}}
						>
							<Icon className="h-4 w-4" />
							{t(labelKey)}
						</Link>
					);
				})}
			</nav>
		);
	}

	return (
		<nav className="space-y-1">
			{navItems.map(({ to, labelKey, Icon }) => {
				return (
					<Link
						key={to}
						to={to}
						activeOptions={{ includeSearch: false }}
						className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors"
						activeProps={{ className: "bg-accent text-accent-foreground" }}
						inactiveProps={{
							className:
								"text-muted-foreground hover:bg-accent hover:text-accent-foreground",
						}}
					>
						<Icon className="h-5 w-5" />
						{t(labelKey)}
					</Link>
				);
			})}
		</nav>
	);
}
