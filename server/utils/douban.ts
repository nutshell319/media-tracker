// 豆瓣影视搜索 — 使用 subject_suggest 接口，无需 API Key
export interface DoubanResult {
  id: string
  title: string
  subTitle: string
  year: string
  img: string
  doubanUrl: string
}

const DOUBAN_SUGGEST = 'https://movie.douban.com/j/subject_suggest'

export async function searchDouban(query: string): Promise<DoubanResult[]> {
  try {
    const res = await $fetch<Array<{
      id: string; title: string; sub_title: string
      year: string; img: string; type: string
    }>>(`${DOUBAN_SUGGEST}?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'MediaTracker/1.0' }
    })

    return res
      .filter(r => r.type === 'movie' || r.type === 'tv')
      .map(r => ({
        id: r.id,
        title: r.title,
        subTitle: r.sub_title || '',
        year: r.year || '',
        img: r.img || '',
        doubanUrl: `https://movie.douban.com/subject/${r.id}/`
      }))
  } catch (e) {
    console.error('豆瓣搜索失败:', e)
    return []
  }
}
