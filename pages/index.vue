<template>
  <div class="app-container">
    <header class="app-header">
      <h1>影视记录</h1>
      <p class="subtitle">记录你看过的每一部作品</p>
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
        <img v-if="r.img" :src="r.img" class="result-cover" />
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
        <img v-if="m.coverUrl" :src="m.coverUrl" class="mc-cover" @click="openDouban(m)" />
        <div v-else class="mc-cover-placeholder" @click="openDouban(m)">{{ m.title[0] }}</div>
        <div class="mc-body">
          <h3 class="mc-title" @click="openDouban(m)">{{ m.title }}</h3>
          <span v-if="m.year" class="mc-year">{{ m.year }}</span>
          <div v-if="m.score" class="mc-score">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= m.score }">★</span>
            {{ m.score }}/5
          </div>
          <p v-if="m.review" class="mc-review">{{ m.review }}</p>
        </div>
        <div class="mc-actions">
          <n-button text size="tiny" @click="editMovie(m)">编辑</n-button>
          <n-button text size="tiny" type="error" @click="removeMovie(m)">删除</n-button>
        </div>
      </div>
    </div>
    <n-empty v-else description="还没有添加任何作品，在上面搜索并添加吧" />

    <!-- 评分弹窗 -->
    <n-modal v-model:show="showModal" :title="editingId ? '编辑记录' : '添加到收藏'" preset="card" style="width:480px;max-width:90vw">
      <div v-if="!editingId && pendingMovie.title" class="preview">
        <img v-if="pendingMovie.img" :src="pendingMovie.img" class="preview-img" />
        <span class="preview-title">{{ pendingMovie.title }} ({{ pendingMovie.year }})</span>
      </div>
      <div class="rating">
        <span v-for="i in 5" :key="i" class="star-big" :class="{ filled: i <= formScore }" @click="formScore = i">★</span>
        <n-button v-if="formScore" text size="small" @click="formScore = 0">清除</n-button>
      </div>
      <n-input v-model:value="formReview" type="textarea" placeholder="写点感想..." :autosize="{ minRows: 2, maxRows: 4 }" style="margin-top:12px" />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="save">{{ editingId ? '更新' : '添加' }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const message = import.meta.client ? useMessage() : { success: () => {}, error: () => {}, warning: () => {} } as any

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
const editingId = ref<string | null>(null)
const pendingMovie = ref<any>({})
const formScore = ref(0)
const formReview = ref('')

function addMovie(item: any) {
  editingId.value = null
  pendingMovie.value = item
  formScore.value = 0
  formReview.value = ''
  showModal.value = true
  results.value = []
  query.value = ''
  searched.value = false
}

function editMovie(m: any) {
  editingId.value = m.id
  formScore.value = m.score || 0
  formReview.value = m.review || ''
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/movies/${editingId.value}`, {
        method: 'PUT',
        body: { score: formScore.value || null, review: formReview.value || null }
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
          score: formScore.value || null,
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
.mc-title { font-size: 1rem; color: #f6f2e8; cursor: pointer; margin-bottom: 4px; }
.mc-title:hover { color: #b98eff; }
.mc-year { font-size: .8rem; color: #aaa59a; }
.mc-score { margin-top: 6px; font-size: .85rem; color: #e85d75; }
.star { color: #333; }
.star.filled { color: #e85d75; }

.mc-review { font-size: .85rem; color: #aaa59a; margin-top: 8px; line-height: 1.5; }
.mc-actions { display: flex; flex-direction: column; gap: 4px; opacity: 0; transition: opacity .2s; }
.movie-card:hover .mc-actions { opacity: 1; }

.preview { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.preview-img { width: 50px; height: 68px; border-radius: 4px; object-fit: cover; }
.preview-title { color: #f6f2e8; }
.rating { display: flex; align-items: center; gap: 4px; }
.star-big { font-size: 1.6rem; color: #333; cursor: pointer; }
.star-big:hover { color: #e85d75; }
.star-big.filled { color: #e85d75; }
</style>
