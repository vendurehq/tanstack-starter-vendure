import Page from '@/features/authentication/routes/forgot-password/page'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'
export const Route = createFileRoute('/forgot-password')({ head: () => storefrontHead({title: m.Auth_forgotPasswordPageTitle(), path: '/forgot-password', noIndex: true}), component: Page })
