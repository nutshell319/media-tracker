import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const movies = await prisma.movie.findMany({
    orderBy: { updatedAt: 'desc' }
  })
  return { movies }
})
