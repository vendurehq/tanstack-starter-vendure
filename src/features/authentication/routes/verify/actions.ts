import { VerifyCustomerAccountMutation } from '@/features/authentication/graphql'
import { verificationInputSchema } from '@/features/authentication/schemas'
import { m } from '@/paraglide/messages.js'
import { disableAuthResponseCaching, setAuthToken } from '@/platform/vendure/auth-token.server'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { createServerFn } from '@tanstack/react-start'

export const verifyAccountAction = createServerFn({ method: 'POST' })
  .validator(verificationInputSchema)
  .handler(async ({ data }) => {
    disableAuthResponseCaching()
    try {
      const result = await mutateOnServer(VerifyCustomerAccountMutation, { token: data.token, password: data.password })
      const verification = result.data.verifyCustomerAccount
      if (verification.__typename !== 'CurrentUser') return { error: verification.message }
      if (result.token) setAuthToken(result.token)
      return { success: true }
    } catch {
      return { error: m.Errors_unexpectedError() }
    }
  })
