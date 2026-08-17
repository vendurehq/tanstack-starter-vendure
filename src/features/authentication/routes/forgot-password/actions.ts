import { RequestPasswordResetMutation } from '@/features/authentication/graphql'
import { passwordResetRequestInputSchema } from '@/features/authentication/schemas'
import { authRateLimitMiddleware, noStoreMiddleware } from '@/platform/middleware'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { createServerFn } from '@tanstack/react-start'

export const requestPasswordResetAction = createServerFn({ method: 'POST' })
  .middleware([noStoreMiddleware, authRateLimitMiddleware])
  .validator(passwordResetRequestInputSchema)
  .handler(async ({ data }) => {
    try {
      await mutateOnServer(RequestPasswordResetMutation, { emailAddress: data.emailAddress })
    } catch {
      // Deliberately return the same response so account existence is not disclosed.
    }
    return { success: true }
  })
