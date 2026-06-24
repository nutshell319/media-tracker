// nuxt.config.ts — Nuxt 3 配置
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: false
  }
})
