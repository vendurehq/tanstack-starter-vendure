import { createServerFn } from "@tanstack/react-start";
import {
	ActiveCustomerFragment,
	GetActiveCustomerQuery,
} from "@/features/account/graphql";
import { queryOnServer } from "@/platform/vendure/api.server";
import {
	disableAuthResponseCaching,
	getAuthToken,
} from "@/platform/vendure/auth-token.server";
import { readFragment } from "@/platform/vendure/graphql";

export const getAccountSession = createServerFn({ method: "GET" }).handler(
	async () => {
		disableAuthResponseCaching();
		if (!getAuthToken()) return null;
		const result = await queryOnServer(
			GetActiveCustomerQuery,
			{},
			{ useAuthToken: true },
		);
		return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
	},
);
