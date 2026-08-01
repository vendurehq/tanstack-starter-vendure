import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { UpdateCustomerEmailAddressMutation } from '@/features/account/graphql'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { disableAuthResponseCaching } from '@/platform/vendure/auth-token.server'

export const verifyEmailUpdateAction = createServerFn({ method: 'POST' })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    disableAuthResponseCaching()
    const result = await mutateOnServer(
      UpdateCustomerEmailAddressMutation,
      { token: data.token },
      { useAuthToken: true },
    )
    const updateResult = result.data.updateCustomerEmailAddress
    return updateResult.__typename === 'Success'
      ? { kind: 'success' as const }
      : { kind: 'failed' as const, message: updateResult.message }
  })
