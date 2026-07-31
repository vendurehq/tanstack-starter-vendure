import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getCurrencyCookie as getCurrencyCookieOnServer,
  setCurrencyCookie as setCurrencyCookieOnServer,
} from './currency.server'

const setCurrencyRpc = createServerFn({ method: 'POST' })
  .validator(z.string().min(3).max(3))
  .handler(({ data }) => setCurrencyCookieOnServer(data))
const getCurrencyRpc = createServerFn({ method: 'GET' }).handler(() => getCurrencyCookieOnServer())

export const setCurrencyCookie = (currencyCode: string) => setCurrencyRpc({ data: currencyCode })
export const getCurrencyCookie = () => getCurrencyRpc()
