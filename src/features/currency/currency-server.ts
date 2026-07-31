import { createServerFn } from '@tanstack/react-start'

export const getActiveCurrencyCode = createServerFn({ method: 'GET' }).handler(async () => {
  const {getActiveCurrencyCodeOnServer} = await import('./active-currency.server')
  return getActiveCurrencyCodeOnServer()
})
