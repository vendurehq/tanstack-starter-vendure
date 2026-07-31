import { getAuthToken } from './auth-token.server.ts'
import type { TadaDocumentNode } from 'gql.tada'
import { type DocumentNode, print } from 'graphql'

const OPERATION_NAME_PATTERN = /\b(?:query|mutation)\s+([A-Za-z_][A-Za-z0-9_]*)/

// Registered by src/config/shop-operations.ts at server startup. Requests are
// only forwarded to Vendure when their document text exactly matches a
// registered operation, so the public server function cannot be used as an
// open proxy with attacker-crafted selection sets.
const canonicalOperations = new Map<string, string>()

export function registerShopOperations(documents: ReadonlyArray<DocumentNode>) {
  for (const document of documents) {
    const printed = print(document)
    const operationName = printed.match(OPERATION_NAME_PATTERN)?.[1]
    if (!operationName) throw new Error('Shop operation document must be a named query or mutation')
    canonicalOperations.set(operationName, printed)
  }
}

const authenticatedOperations = new Set([
  'GetCustomerAddresses', 'GetCustomerOrders', 'GetOrderDetail',
  'CreateCustomerAddress', 'DeleteCustomerAddress', 'RequestUpdateCustomerEmailAddress',
  'UpdateCustomer', 'UpdateCustomerAddress', 'UpdateCustomerEmailAddress', 'UpdateCustomerPassword',
])

export interface VendureServerRequest {
  query: string
  variables: Record<string, unknown>
  options?: {
    token?: string
    useAuthToken?: boolean
    channelToken?: string
    languageCode?: string
    currencyCode?: string
    tags?: string[]
  }
}

interface VendureResponse<T> {
  data?: T
  errors?: Array<{ message: string; [key: string]: unknown }>
}

export async function executeVendureRequest<T>({ query, variables, options }: VendureServerRequest) {
  const operationName = query.match(OPERATION_NAME_PATTERN)?.[1]
  const canonicalQuery = operationName ? canonicalOperations.get(operationName) : undefined
  if (!operationName || !canonicalQuery || canonicalQuery !== query) {
    throw new Error('Vendure operation is not allowed')
  }
  const apiUrl = process.env.VENDURE_SHOP_API_URL
  if (!apiUrl) throw new Error('VENDURE_SHOP_API_URL environment variable is not set')

  const authHeader = process.env.VENDURE_AUTH_TOKEN_HEADER || 'vendure-auth-token'
  const channelHeader = process.env.VENDURE_CHANNEL_TOKEN_HEADER || 'vendure-token'
  const channelToken = options?.channelToken || process.env.VENDURE_CHANNEL_TOKEN || '__default_channel__'
  const token = options?.token || (options?.useAuthToken ? getAuthToken() : undefined)
  if (authenticatedOperations.has(operationName) && !token) {
    throw new Error('Authentication required')
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [channelHeader]: channelToken,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const url = new URL(apiUrl)
  if (options?.languageCode) url.searchParams.set('languageCode', options.languageCode)
  if (options?.currencyCode) url.searchParams.set('currencyCode', options.currencyCode)

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const result = await response.json() as VendureResponse<T>
  if (result.errors) throw new Error(result.errors.map((error) => error.message).join(', '))
  if (!result.data) throw new Error('No data returned from Vendure API')
  const nextToken = response.headers.get(authHeader)
  return { data: result.data, ...(nextToken ? { token: nextToken } : {}) }
}

interface VendureRequestOptions extends NonNullable<VendureServerRequest['options']> {}

export async function queryOnServer<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  variables: TVariables,
  options?: VendureRequestOptions,
) {
  return executeVendureRequest<TResult>({
    query: print(document),
    variables: (variables || {}) as Record<string, unknown>,
    options,
  })
}

export const mutateOnServer = queryOnServer
