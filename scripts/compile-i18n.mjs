import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { compile } from '@inlang/paraglide-js'
import { paraglideOptions } from '../paraglide-options.ts'

await compile(paraglideOptions)

// Paraglide only warns when a plugin module fails to load, then reports a
// successful compile with no messages. Fail here instead of at render time.
const index = await readFile(
  path.join(paraglideOptions.outdir, 'messages', '_index.js'),
  'utf8',
)
if (!/^export /m.test(index)) {
  console.error(
    'Paraglide compiled no messages. Check that the plugin modules in project.inlang/settings.json load.',
  )
  process.exit(1)
}
