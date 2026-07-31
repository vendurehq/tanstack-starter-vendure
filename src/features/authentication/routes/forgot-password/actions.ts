import { RequestPasswordResetMutation } from '@/features/authentication/graphql'
import { m } from '@/paraglide/messages.js'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const requestPasswordResetAction = createServerFn({ method: 'POST' })
  .validator(z.object({ emailAddress: z.email() }))
  .handler(async ({ data }) => {
    try {
      const result = await mutateOnServer(RequestPasswordResetMutation, { emailAddress: data.emailAddress })
      const reset = result.data.requestPasswordReset
      if (reset?.__typename !== 'Success') return { error: reset?.message || m.Errors_failedPasswordReset() }
      return { success: true }
    } catch {
      return { error: m.Errors_unexpectedError() }
    }
  })
