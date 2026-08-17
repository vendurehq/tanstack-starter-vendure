import { createServerFn } from "@tanstack/react-start";
import {
	ActiveCustomerFragment,
	GetActiveCustomerQuery,
} from "@/features/account/graphql";
import { noStoreMiddleware } from "@/platform/middleware";
import { queryOnServer } from "@/platform/vendure/api.server";
import { getAuthToken } from "@/platform/vendure/auth-token.server";
import { readFragment } from "@/platform/vendure/graphql";

export const getAccountSession = createServerFn({ method: "GET" })
	.middleware([noStoreMiddleware])
	.handler(async () => {
		if (!getAuthToken()) return null;
		const result = await queryOnServer(
			GetActiveCustomerQuery,
			{},
			{ useAuthToken: true },
		);
		return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
	});
