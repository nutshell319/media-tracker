<template>
  <ClientOnly>
    <n-config-provider :theme-overrides="themeOverrides">
      <n-message-provider>
        <NuxtPage />
      </n-message-provider>
    </n-config-provider>
    <template #fallback>
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#08090d;color:#b98eff;font-family:sans-serif;">
        加载中...
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'

useHead({
  title: '影视记录',
  meta: [
    { name: 'referrer', content: 'no-referrer' }
  ]
})

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#b98eff',
    primaryColorHover: '#c9a6ff',
    primaryColorPressed: '#a070ee',
    bodyColor: '#08090d',
    cardColor: '#11131a',
    modalColor: '#11131a',
    popoverColor: '#11131a',
    borderColor: '#1e1f2a',
    textColor1: '#f6f2e8',
    textColor2: '#aaa59a',
    textColor3: '#746f66',
    borderRadius: '10px',
    fontFamily: '"Microsoft YaHei", "PingFang SC", system-ui, sans-serif'
  }
}
</script>
