// nuxt.config.ts — Nuxt 3 配置
export default defineNuxtConfig({
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
  },
  nitro: {
    preset: 'vercel'
  }
})
