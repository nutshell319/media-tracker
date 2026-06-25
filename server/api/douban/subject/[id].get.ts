import crypto from 'crypto'

/**
 * 豆瓣作品详情抓取 — 含 PoW 反爬绕过
 * 豆瓣安全页要求客户端计算 SHA-512 哈希碰撞，此处用 Node.js 解题后获取真实页面
 */

/** 计算 SHA-512 哈希的 hex 字符串 */
function sha512hex(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex')
}

/** 解 PoW 挑战：找 nonce 使 SHA512(cha + nonce) 以指定数量的 0 开头 */
function solvePow(cha: string, difficulty = 4): number {
  const target = '0'.repeat(difficulty)
  let nonce = 0
  while (nonce < 1000000) {
    nonce++
    if (sha512hex(cha + nonce).startsWith(target)) {
      return nonce
    }
  }
  return -1 // 未能解题
}

/** 解析安全页面中的隐藏字段 */
function parseSecPage(html: string): { tok: string; cha: string; red: string } | null {
  const tokMatch = html.match(/id="tok"[^>]*value="([^"]*)"/)
  const chaMatch = html.match(/id="cha"[^>]*value="([^"]*)"/)
  const redMatch = html.match(/id="red"[^>]*value="([^"]*)"/)
  if (!tokMatch || !chaMatch || !redMatch) return null
  return {
    tok: tokMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
    cha: chaMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
    red: redMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  }
}

/** 从 HTML 中提取作品信息 */
function extractInfo(html: string) {
  // 评分
  const ratingMatch = html.match(/<strong class="ll rating_num"[^>]*property="v:average"[^>]*>([\d.]+)<\/strong>/)
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null

  // 评分人数
  const votesMatch = html.match(/<span property="v:votes"[^>]*>(\d+)<\/span>/)
  const ratingCount = votesMatch ? parseInt(votesMatch[1]) : null

  // 简介 — 优先完整版
  let summary = ''
  const fullMatch = html.match(/<span class="all hidden"[^>]*>([\s\S]*?)<\/span>/)
  if (fullMatch) {
    summary = fullMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
  } else {
    const shortMatch = html.match(/<span property="v:summary"[^>]*>([\s\S]*?)<\/span>/)
    if (shortMatch) {
      summary = shortMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
    }
  }

  // 封面
  let coverUrl = ''
  const coverMatch = html.match(/<a class="nbgnbg"[^>]*href="([^"]*)"[^>]*title="点击看大图"/)
  if (coverMatch) coverUrl = coverMatch[1]
  if (!coverUrl) {
    const ogMatch = html.match(/<meta property="og:image" content="([^"]*)"/)
    if (ogMatch) coverUrl = ogMatch[1]
  }

  return { rating, ratingCount, summary, coverUrl: coverUrl || null }
}

/** 通用的浏览器请求头 */
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'zh-CN,zh;q=0.9'
}

/** 提取 set-cookie 中的 key=value 对 */
function parseCookies(setCookie: string | null): string {
  if (!setCookie) return ''
  // 可能有多个 cookie，用逗号分隔；每个 cookie 的 ; 后面是属性
  const cookies: string[] = []
  for (const part of setCookie.split(',')) {
    const trimmed = part.trim()
    const semiIdx = trimmed.indexOf(';')
    cookies.push(semiIdx > 0 ? trimmed.substring(0, semiIdx) : trimmed)
  }
  return cookies.join('; ')
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少豆瓣 ID' })

  const targetUrl = `https://movie.douban.com/subject/${id}/`
  let cookies = ''

  // 第一步：请求目标页面，手动处理重定向以跟踪 cookie
  let resp = await $fetch.raw(targetUrl, {
    headers: { ...BROWSER_HEADERS, 'Referer': 'https://movie.douban.com/' },
    redirect: 'manual'
  })

  // 收集初始 cookie
  cookies = appendCookies(cookies, parseCookies(resp.headers.get('set-cookie')))

  // 跟随重定向最多 3 次（处理 movie.douban.com → sec.douban.com 链路）
  for (let i = 0; i < 3; i++) {
    const location = resp.headers.get('location')
    if (!location || (resp.status !== 301 && resp.status !== 302 && resp.status !== 307 && resp.status !== 308)) {
      break
    }
    const redirectUrl = new URL(location, targetUrl).href
    resp = await $fetch.raw(redirectUrl, {
      headers: {
        ...BROWSER_HEADERS,
        'Referer': targetUrl,
        ...(cookies ? { 'Cookie': cookies } : {})
      },
      redirect: 'manual'
    })
    cookies = appendCookies(cookies, parseCookies(resp.headers.get('set-cookie')))
  }

  let html = resp._data as string

  // 判断是否为安全验证页面（sec.douban.com 的 PoW 挑战）
  if (html && html.includes('id="sec"') && html.includes('id="tok"')) {
    const sec = parseSecPage(html)
    if (sec) {
      const sol = solvePow(sec.cha)
      if (sol > 0) {
        // POST 到 sec.douban.com/c（安全页面的表单 action）
        const formData = new URLSearchParams()
        formData.append('tok', sec.tok)
        formData.append('cha', sec.cha)
        formData.append('sol', String(sol))
        formData.append('red', sec.red)

        const postResult = await $fetch.raw('https://sec.douban.com/c', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...BROWSER_HEADERS,
            'Referer': resp.url || targetUrl,
            ...(cookies ? { 'Cookie': cookies } : {})
          },
          body: formData.toString(),
          redirect: 'manual'
        })

        // 获取通行 cookie 并跟随重定向回到 movie.douban.com
        cookies = appendCookies(cookies, parseCookies(postResult.headers.get('set-cookie')))

        const postLocation = postResult.headers.get('location')
        const finalUrl = postLocation ? new URL(postLocation, 'https://sec.douban.com').href : targetUrl

        const finalResp = await $fetch.raw(finalUrl, {
          headers: {
            ...BROWSER_HEADERS,
            'Referer': 'https://movie.douban.com/',
            ...(cookies ? { 'Cookie': cookies } : {})
          }
        })
        html = finalResp._data as string
      }
    }
  }

  // 检测是否仍然被拦截
  if (!html || html.length < 10000 || html.includes('id="sec"')) {
    return {
      id,
      blocked: true,
      rating: null,
      ratingCount: null,
      summary: '',
      coverUrl: null
    }
  }

  const info = extractInfo(html)
  return { id, blocked: false, ...info }
})

/** 合并 cookie 字符串，去重 */
function appendCookies(existing: string, incoming: string): string {
  if (!incoming) return existing
  if (!existing) return incoming
  const map = new Map<string, string>()
  for (const c of existing.split('; ')) {
    const [k, ...v] = c.split('=')
    if (k) map.set(k, v.join('='))
  }
  for (const c of incoming.split('; ')) {
    const [k, ...v] = c.split('=')
    if (k) map.set(k, v.join('='))
  }
  return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
}
