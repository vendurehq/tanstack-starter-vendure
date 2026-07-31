import { LogoutMutation } from './graphql'
import { removeAuthToken } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const logoutAction = createServerFn({ method: 'POST' }).handler(async () => {
  await mutateOnServer(LogoutMutation, {})
  removeAuthToken()
  throw redirect({ href: '/' })
})
