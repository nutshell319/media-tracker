import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少 ID' })

  const body = await readBody(event)
  const { score, review } = body

  const movie = await prisma.movie.update({
    where: { id },
    data: {
      score: score ?? null,
      review: review ?? null
    }
  })

  return { movie }
})
