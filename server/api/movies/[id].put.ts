import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少 ID' })

  const body = await readBody(event)
  const { doubanRating, summary, review } = body

  const data: Record<string, unknown> = {}
  if (doubanRating !== undefined) data.doubanRating = doubanRating ?? null
  if (summary !== undefined) data.summary = summary ?? null
  if (review !== undefined) data.review = review ?? null

  const movie = await prisma.movie.update({ where: { id }, data })

  return { movie }
})
