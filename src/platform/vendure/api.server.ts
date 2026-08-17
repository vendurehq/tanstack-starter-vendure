import type { TadaDocumentNode } from "gql.tada";
import { type DocumentNode, print } from "graphql";
import { env } from "../env.server.ts";
import { logAndThrowPublicError } from "../errors.server.ts";
import { getAuthToken } from "./auth-token.server.ts";

const OPERATION_NAME_PATTERN =
	/\b(?:query|mutation)\s+([A-Za-z_][A-Za-z0-9_]*)/;

// Registered by src/config/shop-operations.ts at server startup. Requests are
// only forwarded to Vendure when their document text exactly matches a
// registered operation, so the public server function cannot be used as an
// open proxy with attacker-crafted selection sets.
const canonicalOperations = new Map<string, string>();

export function registerShopOperations(documents: ReadonlyArray<DocumentNode>) {
	for (const document of documents) {
		const printed = print(document);
		const operationName = printed.match(OPERATION_NAME_PATTERN)?.[1];
		if (!operationName)
			throw new Error(
				"Shop operation document must be a named query or mutation",
			);
		canonicalOperations.set(operationName, printed);
	}
}

const authenticatedOperations = new Set([
	"GetCustomerAddresses",
	"GetCustomerOrders",
	"GetOrderDetail",
	"GetOrderByCode",
	"CreateCustomerAddress",
	"DeleteCustomerAddress",
	"RequestUpdateCustomerEmailAddress",
	"UpdateCustomer",
	"UpdateCustomerAddress",
	"UpdateCustomerEmailAddress",
	"UpdateCustomerPassword",
]);

export interface VendureServerRequest {
	query: string;
	variables: Record<string, unknown>;
	options?: {
		token?: string;
		useAuthToken?: boolean;
		channelToken?: string;
		languageCode?: string;
		currencyCode?: string;
		tags?: string[];
	};
}

interface VendureResponse<T> {
	data?: T;
	errors?: Array<{ message: string; [key: string]: unknown }>;
}

const PUBLIC_REQUEST_ERROR = "Unable to complete the request";

export async function executeVendureRequest<T>({
	query,
	variables,
	options,
}: VendureServerRequest) {
	const operationName = query.match(OPERATION_NAME_PATTERN)?.[1];
	const canonicalQuery = operationName
		? canonicalOperations.get(operationName)
		: undefined;
	if (!operationName || !canonicalQuery || canonicalQuery !== query) {
		throw new Error("Vendure operation is not allowed");
	}
	let apiUrl: string;
	try {
		apiUrl = env.VENDURE_SHOP_API_URL;
	} catch (error) {
		logAndThrowPublicError(error, PUBLIC_REQUEST_ERROR);
	}

	const authHeader = env.VENDURE_AUTH_TOKEN_HEADER;
	const channelHeader = env.VENDURE_CHANNEL_TOKEN_HEADER;
	const channelToken = options?.channelToken || env.VENDURE_CHANNEL_TOKEN;
	const token =
		options?.token || (options?.useAuthToken ? getAuthToken() : undefined);
	if (authenticatedOperations.has(operationName) && !token) {
		throw new Error("Authentication required");
	}
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		[channelHeader]: channelToken,
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const url = new URL(apiUrl);
	if (options?.languageCode)
		url.searchParams.set("languageCode", options.languageCode);
	if (options?.currencyCode)
		url.searchParams.set("currencyCode", options.currencyCode);

	const response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify({ query, variables }),
	});
	if (!response.ok) {
		logAndThrowPublicError(
			`HTTP error! status: ${response.status}`,
			PUBLIC_REQUEST_ERROR,
		);
	}
	const result = (await response.json()) as VendureResponse<T>;
	if (result.errors) {
		logAndThrowPublicError(
			result.errors.map((error) => error.message).join(", "),
			PUBLIC_REQUEST_ERROR,
		);
	}
	if (!result.data) {
		logAndThrowPublicError(
			"No data returned from Vendure API",
			PUBLIC_REQUEST_ERROR,
		);
	}
	const nextToken = response.headers.get(authHeader);
	return { data: result.data, ...(nextToken ? { token: nextToken } : {}) };
}

interface VendureRequestOptions
	extends NonNullable<VendureServerRequest["options"]> {}

export async function queryOnServer<TResult, TVariables>(
	document: TadaDocumentNode<TResult, TVariables>,
	variables: TVariables,
	options?: VendureRequestOptions,
) {
	return executeVendureRequest<TResult>({
		query: print(document),
		variables: (variables || {}) as Record<string, unknown>,
		options,
	});
}

export const mutateOnServer = queryOnServer;
