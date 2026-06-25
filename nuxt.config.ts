// nuxt.config.ts — Nuxt 3 配置
export default defineNuxtConfig({
  ssr: false,  // SPA 模式，纯客户端渲染，无需 ClientOnly/SSR 兼容
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: false
  },
  vite: {
    server: {
      allowedHosts: true  // 允许公网隧道域名访问
    }
  }
})
