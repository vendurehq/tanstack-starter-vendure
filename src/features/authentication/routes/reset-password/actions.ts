import { ResetPasswordMutation } from '@/features/authentication/graphql'
import { passwordResetInputSchema } from '@/features/authentication/schemas'
import { m } from '@/paraglide/messages.js'
import { authRateLimitMiddleware, noStoreMiddleware } from '@/platform/middleware'
import { setAuthToken } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { isRedirect, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const resetPasswordAction = createServerFn({ method: 'POST' })
  .middleware([noStoreMiddleware, authRateLimitMiddleware])
  .validator(passwordResetInputSchema)
  .handler(async ({ data }) => {
    if (data.password !== data.confirmPassword) return { error: m.Errors_passwordsMismatch() }
    try {
      const result = await mutateOnServer(ResetPasswordMutation, { token: data.token, password: data.password })
      const reset = result.data.resetPassword
      if (reset.__typename !== 'CurrentUser') return { error: reset.message }
      if (result.token) setAuthToken(result.token)
      throw redirect({ to: '/' })
    } catch (error) {
      if (isRedirect(error)) throw error
      return { error: m.Errors_unexpectedError() }
    }
  })
