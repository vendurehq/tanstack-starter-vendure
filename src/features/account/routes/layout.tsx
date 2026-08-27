import { Suspense } from "react";
import { AccountNavLinks } from "@/features/account/components/account-nav-links";

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="container mx-auto px-4 py-30">
			{/* Mobile: horizontal tab bar */}
			<div className="md:hidden mb-6">
				<Suspense>
					<AccountNavLinks layout="horizontal" />
				</Suspense>
			</div>

			<div className="flex gap-8">
				{/* Desktop: sidebar */}
				<aside className="hidden md:block w-64 shrink-0">
					<Suspense>
						<AccountNavLinks layout="vertical" />
					</Suspense>
				</aside>
				<div className="flex-1 min-w-0">{children}</div>
			</div>
		</div>
	);
}
