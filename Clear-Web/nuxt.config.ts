// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "Tika",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" }
      ]
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: ['@/assets/fonts/result.css'],
  colorMode: {
    preference: 'light'
  },
  runtimeConfig: {
    public: {
      baseApi: process.env.BASE_API,
    }
  }
})