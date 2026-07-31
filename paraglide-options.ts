import type { CompilerOptions } from '@inlang/paraglide-js'

// Single source of truth for the Paraglide compiler configuration.
// Imported by vite.config.ts (paraglideVitePlugin) and scripts/compile-i18n.mjs
// so CLI-driven compilation cannot drift from the runtime configuration.
export const paraglideOptions = {
  project: './project.inlang',
  outdir: './src/paraglide',
  emitTsDeclarations: true,
  outputStructure: 'message-modules',
  cookieName: 'vendure-locale',
  strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
  urlPatterns: [
    {
      pattern: '/',
      localized: [
        ['en', '/en'],
        ['de', '/de'],
      ],
    },
    {
      pattern: '/:path(.*)?',
      localized: [
        ['en', '/en/:path(.*)?'],
        ['de', '/de/:path(.*)?'],
      ],
    },
  ],
} satisfies CompilerOptions
