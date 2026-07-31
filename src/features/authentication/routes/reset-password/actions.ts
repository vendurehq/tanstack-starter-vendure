import { ResetPasswordMutation } from '@/features/authentication/graphql'
import { m } from '@/paraglide/messages.js'
import { setAuthToken } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const resetPasswordAction = createServerFn({ method: 'POST' })
  .validator(z.object({ token: z.string().min(1), password: z.string().min(1), confirmPassword: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (data.password !== data.confirmPassword) return { error: m.Errors_passwordsMismatch() }
    const result = await mutateOnServer(ResetPasswordMutation, { token: data.token, password: data.password })
    const reset = result.data.resetPassword
    if (reset.__typename !== 'CurrentUser') return { error: reset.message }
    if (result.token) setAuthToken(result.token)
    throw redirect({ href: '/' })
  })
