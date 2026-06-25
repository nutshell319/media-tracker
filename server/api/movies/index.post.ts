import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, year, coverUrl, doubanUrl, doubanRating, summary, review } = body

  if (!title || !doubanUrl) {
    throw createError({ statusCode: 400, statusMessage: '标题和豆瓣链接为必填项' })
  }

  // 豆瓣去重
  const existing = await prisma.movie.findFirst({ where: { doubanUrl } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '此作品已存在' })
  }

  const movie = await prisma.movie.create({
    data: {
      title,
      year: year || null,
      coverUrl: coverUrl || null,
      doubanUrl,
      doubanRating: doubanRating || null,
      summary: summary || null,
      review: review || null
    }
  })

  return { movie }
})
