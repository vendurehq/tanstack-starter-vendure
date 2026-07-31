import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { verifyEmailUpdateAction } from "@/features/account/routes/verify-email/actions";
import Page, {
	type VerificationResult,
} from "@/features/account/routes/verify-email/page";
import { tokenSearchSchema } from "@/platform/tanstack/search";

export const Route = createFileRoute("/account/verify-email")({
	validateSearch: tokenSearchSchema,
	component: VerifyEmailRoute,
});

// The email-change token is single-use, so the mutation must not live in the
// route loader (loaders re-run on preload and router.invalidate()). Fire it
// exactly once from the client instead.
function VerifyEmailRoute() {
	const token = Route.useSearch().token;
	const verifyEmail = useServerFn(verifyEmailUpdateAction);
	const [result, setResult] = useState<VerificationResult | null>(null);
	const startedRef = useRef(false);

	useEffect(() => {
		if (!token || startedRef.current) return;
		startedRef.current = true;
		verifyEmail({ data: { token } })
			.then(setResult)
			.catch(() => setResult({ kind: "error" }));
	}, [token, verifyEmail]);

	if (!token) return <Page result={{ kind: "invalid" }} />;
	if (!result) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}
	return <Page result={result} />;
}
