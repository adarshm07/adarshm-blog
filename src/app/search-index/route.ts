import { getSearchIndex } from '@/app/lib/search-index'

// Built once at build time and served as a static asset: the palette fetches it
// on first open, so it costs nothing on initial page load.
export const dynamic = 'force-static'

export function GET() {
  return Response.json(getSearchIndex(), {
    headers: { 'cache-control': 'public, max-age=0, must-revalidate' },
  })
}
