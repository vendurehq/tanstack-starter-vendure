import { LoginMutation } from '@/features/authentication/graphql'
import { loginInputSchema } from '@/features/authentication/schemas'
import { m } from '@/paraglide/messages.js'
import { disableAuthResponseCaching, setAuthToken } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { isRedirect, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { safeInternalRedirect } from '@/platform/tanstack/redirect'

export const loginAction = createServerFn({ method: 'POST' })
  .validator(loginInputSchema)
  .handler(async ({ data }) => {
    disableAuthResponseCaching()
    try {
      const result = await mutateOnServer(LoginMutation, { username: data.username, password: data.password }, { useAuthToken: true })
      const login = result.data.login
      if (login.__typename !== 'CurrentUser') {
        return { error: login.__typename === 'NotVerifiedError' ? m.Errors_verifyEmailFirst() : m.Errors_invalidCredentials() }
      }
      if (result.token) setAuthToken(result.token)
      throw redirect({ href: safeInternalRedirect(data.redirectTo) })
    } catch (error) {
      if (isRedirect(error)) throw error
      return { error: m.Errors_unexpectedError() }
    }
  })
