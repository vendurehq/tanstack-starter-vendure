import { routing } from '../i18n/routing.ts'
import { invalidatePublicTag } from '../cache/public-cache.ts'

type TagKind = 'locale-only' | 'currency-dependent'
const TAG_RULES: ReadonlyArray<{ match: string | RegExp; kind: TagKind }> = [
  { match: 'collections', kind: 'locale-only' },
  { match: 'countries', kind: 'locale-only' },
  { match: 'featured', kind: 'currency-dependent' },
  { match: /^footer$/, kind: 'locale-only' },
  { match: /^navbar-collections$/, kind: 'locale-only' },
  { match: /^mobile-nav$/, kind: 'locale-only' },
  { match: /^product-.+$/, kind: 'currency-dependent' },
  { match: /^collection-.+$/, kind: 'currency-dependent' },
  { match: /^related-products-.+$/, kind: 'currency-dependent' },
]
const MAX_TAGS_PER_REQUEST = 100

function classifyTag(tag: string): TagKind | null {
  return TAG_RULES.find((rule) =>
    typeof rule.match === 'string' ? rule.match === tag : rule.match.test(tag),
  )?.kind ?? null
}

export async function handleRevalidation(request: Request) {
  const expectedToken = process.env.REVALIDATION_SECRET
  if (!expectedToken) return Response.json({ error: 'Server configuration error' }, { status: 500 })
  if (request.headers.get('authorization') !== `Bearer ${expectedToken}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as { tags?: unknown }
    if (!Array.isArray(body.tags) || body.tags.length === 0) {
      return Response.json({ error: 'Missing or invalid "tags" array in request body' }, { status: 400 })
    }
    if (body.tags.length > MAX_TAGS_PER_REQUEST) {
      return Response.json({ error: `Too many tags (max ${MAX_TAGS_PER_REQUEST})` }, { status: 400 })
    }

    let currencies: string[] | undefined
    const results: Array<{ tag: string; success: boolean; error?: string }> = []
    for (const rawTag of body.tags) {
      if (typeof rawTag !== 'string') {
        results.push({ tag: String(rawTag), success: false, error: 'Invalid tag type' })
        continue
      }
      const kind = classifyTag(rawTag)
      if (!kind) {
        results.push({ tag: rawTag, success: false, error: 'Unknown tag' })
        continue
      }
      if (kind === 'currency-dependent') {
        const {getActiveChannel} = await import('../vendure/channel.ts')
        currencies ??= (await getActiveChannel()).availableCurrencyCodes as string[]
      }
      const currencyCodes = currencies ?? []
      for (const locale of routing.locales) {
        const expanded = kind === 'locale-only'
          ? [`${rawTag}-${locale}`]
          : currencyCodes.map((currency) => `${rawTag}-${locale}-${currency}`)
        for (const tag of expanded) {
          invalidatePublicTag(tag)
          results.push({ tag, success: true })
        }
      }
    }
    const allSuccessful = results.every((result) => result.success)
    return Response.json(
      { revalidated: allSuccessful, results, timestamp: Date.now() },
      { status: allSuccessful ? 200 : 207 },
    )
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}
