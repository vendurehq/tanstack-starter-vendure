import { RegisterCustomerAccountMutation } from '@/features/authentication/graphql'
import { m } from '@/paraglide/messages.js'
import { mutateOnServer } from '@/platform/vendure/api.server'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const registerAction = createServerFn({ method: 'POST' })
  .validator(z.object({
    emailAddress: z.email(), firstName: z.string().optional(), lastName: z.string().optional(),
    phoneNumber: z.string().optional(), password: z.string().min(1), redirectTo: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    if (!data.emailAddress || !data.password) return { error: m.Errors_emailPasswordRequired() }
    const result = await mutateOnServer(RegisterCustomerAccountMutation, { input: {
      emailAddress: data.emailAddress, firstName: data.firstName || undefined,
      lastName: data.lastName || undefined, phoneNumber: data.phoneNumber || undefined, password: data.password,
    } })
    const registration = result.data.registerCustomerAccount
    if (registration.__typename !== 'Success') return { error: registration.message }
    const verifyUrl = data.redirectTo ? `/verify-pending?redirectTo=${encodeURIComponent(data.redirectTo)}` : '/verify-pending'
    throw redirect({ href: verifyUrl })
  })
