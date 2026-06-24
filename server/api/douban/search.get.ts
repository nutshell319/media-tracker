import { searchDouban } from '~/server/utils/douban'

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string
  if (!q || q.trim().length === 0) return { results: [] }
  const results = await searchDouban(q.trim())
  return { results }
})
