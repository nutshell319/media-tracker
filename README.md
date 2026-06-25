# 🎬 影视记录

> 个人影视收藏管理工具 — 搜索豆瓣、自动拉取评分简介、记录个人短评。

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js" alt="Nuxt 3">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="Neon PostgreSQL">
  <img src="https://img.shields.io/badge/Naive%20UI-2-18a058?logo=naiveui" alt="Naive UI">
  <img src="https://img.shields.io/badge/deploy-Render-46E3B7?logo=render" alt="Render">
</p>

---

## ✨ 功能

- 🔍 **豆瓣搜索** — 输入影视名称，实时搜索豆瓣匹配结果
- ⭐ **自动抓取评分** — 从豆瓣详情页自动提取评分、评分人数
- 📝 **作品简介** — 自动获取豆瓣完整剧情简介
- 🖼️ **封面展示** — 服务端代理豆瓣图片，自动绕过防盗链
- 💬 **个人短评** — 收藏后添加自己的观后感/短评
- 🔗 **豆瓣跳转** — 点击标题直接打开豆瓣详情页
- 🎨 **深色紫红主题** — 沉浸式观影记录体验

## 🛠 技术栈

| 类型 | 技术 |
|------|------|
| 框架 | Nuxt 3 (SPA 模式) |
| UI 库 | Naive UI |
| ORM | Prisma |
| 数据库 | Neon PostgreSQL (云端) / SQLite (本地开发) |
| 部署 | Render |

## 🚀 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DATABASE_URL

# 启动开发服务器
npx nuxt dev
```

## 📦 部署

部署到 [Render](https://render.com)：

| 配置项 | 值 |
|--------|-----|
| Build Command | `npm run build` |
| Start Command | `node .output/server/index.mjs` |
| Env: `DATABASE_URL` | PostgreSQL 连接串（如 Neon） |

---

**Author:** [nutshell319](https://github.com/nutshell319)
