import { LoginMutation } from '@/features/authentication/graphql'
import { m } from '@/paraglide/messages.js'
import { setAuthToken } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { safeInternalRedirect } from '@/platform/tanstack/redirect'

export const loginAction = createServerFn({ method: 'POST' })
  .validator(z.object({ username: z.email(), password: z.string().min(1), redirectTo: z.string().optional() }))
  .handler(async ({ data }) => {
    const result = await mutateOnServer(LoginMutation, { username: data.username, password: data.password }, { useAuthToken: true })
    const login = result.data.login
    if (login.__typename !== 'CurrentUser') {
      return { error: login.__typename === 'NotVerifiedError' ? m.Errors_verifyEmailFirst() : m.Errors_invalidCredentials() }
    }
    if (result.token) setAuthToken(result.token)
    const safeRedirect = safeInternalRedirect(data.redirectTo)
    throw redirect({ href: safeRedirect })
  })
