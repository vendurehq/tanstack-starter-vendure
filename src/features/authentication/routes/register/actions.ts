import { RegisterCustomerAccountMutation } from '@/features/authentication/graphql'
import { registrationInputSchema } from '@/features/authentication/schemas'
import { m } from '@/paraglide/messages.js'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { disableAuthResponseCaching } from '@/platform/vendure/auth-token.server'
import { safeInternalRedirect } from '@/platform/tanstack/redirect'
import { isRedirect, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const registerAction = createServerFn({ method: 'POST' })
  .validator(registrationInputSchema)
  .handler(async ({ data }) => {
    disableAuthResponseCaching()
    try {
      const result = await mutateOnServer(RegisterCustomerAccountMutation, { input: {
        emailAddress: data.emailAddress, firstName: data.firstName,
        lastName: data.lastName, phoneNumber: data.phoneNumber, password: data.password,
      } })
      const registration = result.data.registerCustomerAccount
      if (registration.__typename !== 'Success') return { error: registration.message }
      throw redirect({
        to: '/verify-pending',
        search: {redirectTo: data.redirectTo ? safeInternalRedirect(data.redirectTo) : undefined},
      })
    } catch (error) {
      if (isRedirect(error)) throw error
      return { error: m.Errors_unexpectedError() }
    }
  })
