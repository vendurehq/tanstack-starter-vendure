import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getAuthToken as getAuthTokenOnServer,
  removeAuthToken as removeAuthTokenOnServer,
  setAuthToken as setAuthTokenOnServer,
} from './auth-token.server'

const setAuthTokenRpc = createServerFn({ method: 'POST' })
  .validator(z.string().min(1))
  .handler(({ data }) => setAuthTokenOnServer(data))
const getAuthTokenRpc = createServerFn({ method: 'GET' }).handler(() => getAuthTokenOnServer())
const removeAuthTokenRpc = createServerFn({ method: 'POST' }).handler(() => removeAuthTokenOnServer())

export const setAuthToken = (token: string) => setAuthTokenRpc({ data: token })
export const getAuthToken = () => getAuthTokenRpc()
export const removeAuthToken = () => removeAuthTokenRpc()
