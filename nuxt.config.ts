// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: { preset: 'aws_amplify' },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      userPoolId: process.env.NUXT_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.NUXT_PUBLIC_USER_POOL_CLIENT_ID || '',
      awsRegion: process.env.NUXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
    },
  },
});
