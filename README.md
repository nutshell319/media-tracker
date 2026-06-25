<p align="center">
  <img src="https://img.shields.io/badge/Nuxt_3-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt 3">
  <img src="https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Naive_UI-18a058?style=for-the-badge&logo=naiveui&logoColor=white" alt="Naive UI">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render">
</p>

<h1 align="center">🎬 影视记录</h1>

<p align="center">
  <strong>个人影视收藏管理工具</strong><br>
  豆瓣搜索 · 自动抓取评分简介 · 个人短评，一站式记录你的观影足迹
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a>
  &nbsp;·&nbsp;
  <a href="#-使用方法">使用方法</a>
  &nbsp;·&nbsp;
  <a href="#-技术架构">技术架构</a>
  &nbsp;·&nbsp;
  <a href="#-本地开发">本地开发</a>
  &nbsp;·&nbsp;
  <a href="#-部署">部署</a>
</p>

---

## ✨ 功能特性

<table>
  <tr>
    <td width="50%">
      <h4>🔍 智能搜索</h4>
      <ul>
        <li>输入影视名称，实时查询豆瓣</li>
        <li>电影 / 电视剧自动识别</li>
        <li>搜索结果带封面预览</li>
      </ul>
    </td>
    <td width="50%">
      <h4>📊 自动抓取</h4>
      <ul>
        <li><strong>豆瓣评分</strong> — 自动提取评分 & 评分人数</li>
        <li><strong>作品简介</strong> — 完整剧情梗概</li>
        <li><strong>高清封面</strong> — 服务端代理，绕过防盗链</li>
      </ul>
    </td>
  </tr>
</table>

### 核心亮点

| 亮点 | 说明 |
|------|------|
| 🔗 **豆瓣打通** | 搜索 → 选片 → 自动抓取，一键完成 |
| 🛡️ **反爬绕过** | 内置 SHA-512 PoW 解题引擎，穿透豆瓣安全验证 |
| 🖼️ **图片代理** | 服务端转发豆瓣 CDN 图片，解决 418 防盗链 |
| 💬 **个人短评** | 收藏后自由记录观后感和笔记 |
| 🎨 **深色主题** | 紫红配色 + 暗格纹理背景，沉浸式体验 |
| 📱 **响应式设计** | 桌面 / 平板 / 手机全适配 |
| ☁️ **云端数据库** | Neon PostgreSQL，数据永久保存不丢失 |

---

## 🚀 使用方法

### 在线访问
Render 部署地址（配置后获取）

### 使用流程

```
搜索影视 → 点击结果 → 自动拉取豆瓣评分简介 → 写短评 → 添加收藏
```

1. **搜索** — 在搜索框输入任意影视作品名称
2. **确认** — 从豆瓣搜索结果中点击你要收藏的
3. **查看** — 自动展示豆瓣评分、评分人数、剧情简介
4. **记录** — 可选写几句个人感想
5. **管理** — 随时编辑短评或删除收藏

---

## 🎨 界面预览

```
┌──────────────────────────────────────────────┐
│               🎬 影 视 记 录                   │
│          记录你看过的每一部作品                  │
│                    ━━━━                       │
│                                              │
│  ┌──────────────────────────────┐ [ 搜索 ]   │
│  │ 输入影视作品名称搜索...        │            │
│  └──────────────────────────────┘            │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 🎬 肖申克的救赎          ⭐ 9.7  │   │
│  │ 1994                                │   │
│  │ 一场谋杀案使银行家安迪蒙冤入狱...      │   │
│  │ 💬 永远相信希望的力量               │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 🎬 海上钢琴师            ⭐ 9.3  │   │
│  │ 1998                                │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## 🛠 技术架构

### 技术栈

| 技术 | 用途 |
|------|------|
| **Nuxt 3** | 全栈框架，SPA 模式 |
| **Vue 3** | Composition API，响应式数据 |
| **Naive UI** | 组件库，全局深色主题覆盖 |
| **Prisma** | ORM，类型安全数据库操作 |
| **Neon PostgreSQL** | 免费云端数据库 |
| **Nitro** | Nuxt 内建服务端引擎 |
| **Render** | 平台托管，Git 推送即部署 |

### 架构亮点

- **PoW 反爬引擎** — 拦截豆瓣安全验证页 → 解析 SHA-512 挑战 → 计算 nonce 碰撞 → 提交通过 → 获取真实数据
- **图片代理层** — 客户端请求 `/api/douban/image` → 服务端以 `Referer: movie.douban.com` 转发 → 绕过 418 防盗链
- **双模数据库** — 本地开发用 SQLite（零配置），生产环境自动切换 Neon PostgreSQL

---

## 💻 本地开发

```bash
# 克隆仓库
git clone https://github.com/nutshell319/media-tracker.git
cd media-tracker

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 DATABASE_URL

# 启动开发服务器
npx nuxt dev

# 构建生产版本
pnpm build

# 启动生产服务器
node .output/server/index.mjs
```

---

## 📁 项目结构

```
media-tracker/
├── pages/
│   └── index.vue              # 主页面（搜索、列表、弹窗）
├── server/
│   ├── api/
│   │   ├── douban/
│   │   │   ├── search.get.ts       # 豆瓣搜索 API
│   │   │   ├── subject/[id].get.ts # 豆瓣详情抓取（含 PoW 绕过）
│   │   │   └── image.get.ts        # 图片代理（防盗链）
│   │   └── movies/
│   │       ├── index.get.ts        # 获取收藏列表
│   │       ├── index.post.ts       # 添加收藏
│   │       ├── [id].put.ts         # 更新收藏
│   │       └── [id].delete.ts      # 删除收藏
│   └── utils/
│       └── prisma.ts              # 数据库客户端
├── prisma/
│   └── schema.prisma              # 数据库模型定义
├── assets/css/
│   └── main.css                   # 全局样式变量
├── app.vue                        # 根组件
├── nuxt.config.ts                 # Nuxt 配置
├── start.ps1                      # Windows 一键启动脚本
└── package.json
```

---

## 🚢 部署

### Render

| 配置项 | 值 |
|--------|-----|
| Build Command | `npm run build` |
| Start Command | `node .output/server/index.mjs` |
| Environment | `DATABASE_URL` = PostgreSQL 连接串 |

推送代码即自动部署。

### 本地隧道（临时分享）

```bash
# 启动服务器
node .output/server/index.mjs

# 另开终端，启动公网隧道
ssh -R 80:localhost:3000 localhost.run
```

---

## 📄 开源协议

[MIT License](LICENSE)

---

<p align="center">
  Made with ✨ by <a href="https://github.com/nutshell319">nutshell319</a>
</p>
