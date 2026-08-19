import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { paraglideOptions } from './paraglide-options.ts'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production' && !env.VITE_SITE_URL) {
    throw new Error('VITE_SITE_URL is required for production builds')
  }

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      paraglideVitePlugin(paraglideOptions),
      nitro(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  }
})

export default config
