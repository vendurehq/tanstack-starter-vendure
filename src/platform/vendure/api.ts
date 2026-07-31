import { createServerFn } from '@tanstack/react-start'
import type { TadaDocumentNode } from 'gql.tada'
import { print } from 'graphql'
import { executeVendureRequest, type VendureServerRequest } from './api.server'

interface VendureRequestOptions {
  token?: string
  useAuthToken?: boolean
  channelToken?: string
  languageCode?: string
  currencyCode?: string
  fetch?: Record<string, never>
  tags?: string[]
}

const vendureRequest = createServerFn({ method: 'POST' })
  .validator((data: VendureServerRequest) => data)
  .handler(({ data }) => executeVendureRequest<unknown>(data))

export async function query<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  return vendureRequest({
    data: {
      query: print(document),
      variables: (variables || {}) as Record<string, unknown>,
      options: options ? {
        token: options.token,
        useAuthToken: options.useAuthToken,
        channelToken: options.channelToken,
        languageCode: options.languageCode,
        currencyCode: options.currencyCode,
        tags: options.tags,
      } : undefined,
    },
  }) as Promise<{ data: TResult; token?: string }>
}

export async function mutate<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  // @ts-expect-error conditional tuple types are equivalent at runtime
  return query(document, variables, options)
}
