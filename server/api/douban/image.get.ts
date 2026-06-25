/**
 * 豆瓣图片代理 — 解决防盗链 418 问题
 * 客户端请求此端点，服务端以正确 Referer 转发到豆瓣 CDN
 * 用法：GET /api/douban/image?url=https://img3.doubanio.com/view/photo/.../p123.jpg
 */
export default defineEventHandler(async (event) => {
  const url = getQuery(event).url as string
  if (!url) throw createError({ statusCode: 400, statusMessage: '缺少图片 URL' })

  // 安全检查：只允许豆瓣 CDN 域名
  const parsed = new URL(url)
  if (!parsed.hostname.endsWith('doubanio.com') && !parsed.hostname.endsWith('douban.com')) {
    throw createError({ statusCode: 403, statusMessage: '仅允许豆瓣图片域名' })
  }

  try {
    const imageData = await $fetch<ArrayBuffer>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://movie.douban.com/'
      },
      responseType: 'arrayBuffer'
    })

    // 根据 URL 推断 Content-Type
    const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg'
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', gif: 'image/gif', avif: 'image/avif'
    }

    setHeader(event, 'Content-Type', mimeMap[ext] || 'image/jpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=604800') // 浏览器缓存 7 天
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    return new Uint8Array(imageData)
  } catch (err: any) {
    console.error('[douban/image] 代理失败:', err.message)
    throw createError({ statusCode: 502, statusMessage: '图片加载失败' })
  }
})
