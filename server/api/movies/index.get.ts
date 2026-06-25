import { prisma } from '~/server/utils/prisma'
import type { Prisma } from '@prisma/client'

const sortMap: Record<string, Prisma.MovieOrderByWithRelationInput> = {
  date_desc:    { createdAt: 'desc' },     // 最近添加
  date_asc:     { createdAt: 'asc' },      // 最早添加
  rating_desc:  { doubanRating: 'desc' },  // 评分最高
  rating_asc:   { doubanRating: 'asc' },   // 评分最低
  year_desc:    { year: 'desc' },          // 年份最新
  year_asc:     { year: 'asc' },           // 年份最早
  title_asc:    { title: 'asc' },          // 名称 A-Z
  title_desc:   { title: 'desc' },         // 名称 Z-A
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sort = (query.sort as string) || 'date_desc'
  const orderBy = sortMap[sort] || sortMap['date_desc']

  const movies = await prisma.movie.findMany({ orderBy })
  return { movies }
})
