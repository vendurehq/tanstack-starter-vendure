import { RequestPasswordResetMutation } from '@/features/authentication/graphql'
import { passwordResetRequestInputSchema } from '@/features/authentication/schemas'
import { disableAuthResponseCaching } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { createServerFn } from '@tanstack/react-start'

export const requestPasswordResetAction = createServerFn({ method: 'POST' })
  .validator(passwordResetRequestInputSchema)
  .handler(async ({ data }) => {
    disableAuthResponseCaching()
    try {
      await mutateOnServer(RequestPasswordResetMutation, { emailAddress: data.emailAddress })
    } catch {
      // Deliberately return the same response so account existence is not disclosed.
    }
    return { success: true }
  })
