<template>
  <div class="app-container">
    <header class="app-header">
      <h1>影视记录</h1>
      <p class="subtitle">记录你看过的每一部作品</p>
      <a class="github-link" href="https://github.com/nutshell319" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        nutshell319
      </a>
      <div class="divider"></div>
    </header>

    <!-- 搜索框 -->
    <div class="search-bar">
      <n-input v-model:value="query" placeholder="输入影视作品名称搜索..." size="large" clearable @keyup.enter="search" />
      <n-button type="primary" size="large" :loading="loading" @click="search">搜索</n-button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="results.length" class="results">
      <div v-for="r in results" :key="r.id" class="result-item" @click="addMovie(r)">
        <img v-if="r.img" :src="proxyImage(r.img)" class="result-cover" />
        <div v-else class="result-cover-placeholder">{{ r.title[0] }}</div>
        <div>
          <span class="result-title">{{ r.title }}</span>
          <span class="result-sub">{{ r.year }} {{ r.subTitle }}</span>
        </div>
      </div>
    </div>
    <n-empty v-else-if="searched" description="未找到相关作品" />

    <!-- 收藏列表 -->
    <div v-if="movies.length" class="movie-list">
      <div v-for="m in movies" :key="m.id" class="movie-card">
        <img v-if="m.coverUrl" :src="proxyImage(m.coverUrl)" class="mc-cover" @click="openDouban(m)" />
        <div v-else class="mc-cover-placeholder" @click="openDouban(m)">{{ m.title[0] }}</div>
        <div class="mc-body">
          <div class="mc-top-row">
            <h3 class="mc-title" @click="openDouban(m)">{{ m.title }}</h3>
            <span v-if="m.doubanRating" class="mc-rating-badge">⭐ {{ m.doubanRating }}</span>
          </div>
          <span v-if="m.year" class="mc-year">{{ m.year }}</span>
          <p v-if="m.summary" class="mc-summary">{{ m.summary }}</p>
          <p v-if="m.review" class="mc-review">💬 {{ m.review }}</p>
        </div>
        <div class="mc-actions">
          <n-button text size="tiny" @click="editMovie(m)">编辑</n-button>
          <n-button text size="tiny" type="error" @click="removeMovie(m)">删除</n-button>
        </div>
      </div>
    </div>
    <n-empty v-else description="还没有添加任何作品，在上面搜索并添加吧" />

    <!-- 评分弹窗 -->
    <n-modal v-model:show="showModal" :title="editingId ? '编辑记录' : '添加到收藏'" preset="card" style="width:520px;max-width:90vw">
      <!-- 新增模式：展示从豆瓣抓取的信息 -->
      <div v-if="!editingId">
        <div class="modal-loading" v-if="fetchingDetail">
          <n-spin size="medium" />
          <span style="margin-left:12px;color:#aaa59a">正在获取豆瓣信息...</span>
        </div>
        <template v-else>
          <div class="preview" v-if="pendingMovie.title">
            <img v-if="pendingMovie.img" :src="proxyImage(pendingMovie.img)" class="preview-img" />
            <div v-else class="preview-img-placeholder">{{ pendingMovie.title[0] }}</div>
            <div>
              <div class="preview-title">{{ pendingMovie.title }} <span v-if="pendingMovie.year" class="preview-year">({{ pendingMovie.year }})</span></div>
              <div v-if="pendingMovie.rating" class="preview-rating">豆瓣评分 ⭐ {{ pendingMovie.rating }}</div>
            </div>
          </div>
          <div v-if="pendingMovie.summary" class="preview-summary">{{ pendingMovie.summary }}</div>
        </template>
      </div>
      <!-- 编辑模式 -->
      <template v-else>
        <div v-if="editTarget.coverUrl" class="preview">
          <img :src="proxyImage(editTarget.coverUrl)" class="preview-img" />
          <div>
            <div class="preview-title">{{ editTarget.title }} <span v-if="editTarget.year" class="preview-year">({{ editTarget.year }})</span></div>
            <div v-if="editTarget.doubanRating" class="preview-rating">豆瓣评分 ⭐ {{ editTarget.doubanRating }}</div>
          </div>
        </div>
      </template>

      <!-- 个人短评输入 -->
      <n-input v-model:value="formReview" type="textarea" placeholder="写点个人感想..." :autosize="{ minRows: 2, maxRows: 4 }" :style="{ marginTop: fetchingDetail ? '0' : '12px' }" />

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" :disabled="fetchingDetail" @click="save">{{ editingId ? '更新' : '添加' }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'

definePageMeta({ ssr: false })

const message = import.meta.client ? useMessage() : { success: () => {}, error: () => {}, warning: () => {} } as any

/** 将豆瓣图片 URL 代理到本地端点，绕过防盗链 */
function proxyImage(url: string | null | undefined): string {
  if (!url) return ''
  if (url.includes('doubanio.com') || url.includes('douban.com')) {
    return `/api/douban/image?url=${encodeURIComponent(url)}`
  }
  return url
}

// 搜索
const query = ref('')
const loading = ref(false)
const searched = ref(false)
const results = ref<any[]>([])

async function search() {
  if (!query.value.trim()) return
  loading.value = true; searched.value = true
  try {
    const data = await $fetch(`/api/douban/search?q=${encodeURIComponent(query.value.trim())}`)
    results.value = data.results
  } catch { results.value = [] }
  finally { loading.value = false }
}

// 收藏列表
const movies = ref<any[]>([])

async function fetchMovies() {
  try {
    const data = await $fetch('/api/movies')
    movies.value = data.movies
  } catch { /* */ }
}

// 弹窗
const showModal = ref(false)
const saving = ref(false)
const fetchingDetail = ref(false)
const editingId = ref<string | null>(null)
const pendingMovie = ref<any>({})
const editTarget = ref<any>({})
const formReview = ref('')

// 从搜索结果添加 — 先拉取豆瓣详情
async function addMovie(item: any) {
  editingId.value = null
  pendingMovie.value = { ...item, rating: null, summary: '' }
  formReview.value = ''
  showModal.value = true
  fetchingDetail.value = true

  // 清除搜索结果
  results.value = []
  query.value = ''
  searched.value = false

  // 抓取豆瓣评分 + 简介
  try {
    const detail = await $fetch(`/api/douban/subject/${item.id}`)
    pendingMovie.value.rating = detail.rating
    pendingMovie.value.summary = detail.summary
    // 如果有更高清的封面，使用详情页的
    if (detail.coverUrl) pendingMovie.value.img = detail.coverUrl
  } catch {
    // 抓取失败也不影响添加，只是没有评分和简介
  } finally {
    fetchingDetail.value = false
  }
}

function editMovie(m: any) {
  editingId.value = m.id
  editTarget.value = m
  formReview.value = m.review || ''
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/movies/${editingId.value}`, {
        method: 'PUT',
        body: { review: formReview.value || null }
      })
      message.success('已更新')
    } else {
      await $fetch('/api/movies', {
        method: 'POST',
        body: {
          title: pendingMovie.value.title,
          year: pendingMovie.value.year ? parseInt(pendingMovie.value.year) : null,
          coverUrl: pendingMovie.value.img || null,
          doubanUrl: pendingMovie.value.doubanUrl,
          doubanRating: pendingMovie.value.rating || null,
          summary: pendingMovie.value.summary || null,
          review: formReview.value || null
        }
      })
      message.success('已添加')
    }
    showModal.value = false
    await fetchMovies()
  } catch (err: any) {
    message.error(err?.data?.statusMessage || '操作失败')
  } finally { saving.value = false }
}

async function removeMovie(m: any) {
  await $fetch(`/api/movies/${m.id}`, { method: 'DELETE' })
  await fetchMovies()
}

function openDouban(m: any) {
  if (m.doubanUrl) window.open(m.doubanUrl, '_blank')
}

onMounted(fetchMovies)
</script>

<style scoped>
.app-container {
  max-width: 800px; margin: 0 auto; padding: 40px 24px 80px;
}
.app-header { text-align: center; padding: 32px 0 12px; }
.app-header h1 { font-size: 2rem; font-weight: 700; color: #b98eff; letter-spacing: 4px; }
.subtitle { font-size: .9rem; color: #aaa59a; margin-top: 6px; }
.github-link {
  display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;
  font-size: .8rem; color: #746f66; transition: color .2s;
}
.github-link:hover { color: #b98eff; }
.divider { width: 60px; height: 2px; background: #b98eff; margin: 16px auto 0; border-radius: 1px; }

.search-bar { display: flex; gap: 12px; margin-bottom: 24px; }
.search-bar > :first-child { flex: 1; }

.results { background: #11131a; border: 1px solid #1e1f2a; border-radius: 10px; overflow: hidden; }
.result-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; }
.result-item:hover { background: #1a1a28; }
.result-item + .result-item { border-top: 1px solid #1e1f2a; }
.result-cover { width: 40px; height: 54px; border-radius: 4px; object-fit: cover; }
.result-cover-placeholder {
  width: 40px; height: 54px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  background: #1a1a25; color: #b98eff; font-weight: 700;
}
.result-title { color: #f6f2e8; font-size: .95rem; display: block; }
.result-sub { color: #aaa59a; font-size: .8rem; display: block; }

/* 卡片 */
.movie-list { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
.movie-card {
  display: flex; gap: 16px; background: #11131a; border: 1px solid #1e1f2a;
  border-radius: 10px; padding: 16px; transition: border-color .2s;
}
.movie-card:hover { border-color: #b98eff33; }
.mc-cover { width: 80px; height: 110px; border-radius: 6px; object-fit: cover; cursor: pointer; flex-shrink: 0; }
.mc-cover-placeholder {
  width: 80px; height: 110px; border-radius: 6px; flex-shrink: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 700; color: #b98eff; background: #1a1a25;
}
.mc-body { flex: 1; min-width: 0; }
.mc-top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.mc-title { font-size: 1rem; color: #f6f2e8; cursor: pointer; display: inline; }
.mc-title:hover { color: #b98eff; }
.mc-rating-badge {
  font-size: .8rem; color: #f6f2e8; background: #e85d75; padding: 0 6px; border-radius: 4px;
  white-space: nowrap; font-weight: 600;
}
.mc-year { font-size: .8rem; color: #aaa59a; }
.mc-summary {
  font-size: .82rem; color: #aaa59a; margin-top: 8px; line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.mc-review { font-size: .85rem; color: #c9a6ff; margin-top: 6px; line-height: 1.5; }

.mc-actions { display: flex; flex-direction: column; gap: 4px; opacity: 0; transition: opacity .2s; }
.movie-card:hover .mc-actions { opacity: 1; }

/* 弹窗 */
.modal-loading { display: flex; align-items: center; justify-content: center; padding: 20px 0; }
.preview { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.preview-img { width: 50px; height: 68px; border-radius: 4px; object-fit: cover; }
.preview-img-placeholder {
  width: 50px; height: 68px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 700; color: #b98eff; background: #1a1a25; flex-shrink: 0;
}
.preview-title { color: #f6f2e8; font-size: .95rem; }
.preview-year { color: #aaa59a; font-size: .85rem; }
.preview-rating { font-size: .85rem; color: #e85d75; margin-top: 4px; font-weight: 600; }
.preview-summary {
  font-size: .85rem; color: #aaa59a; line-height: 1.7; margin-bottom: 4px;
  max-height: 120px; overflow-y: auto;
}
</style>
