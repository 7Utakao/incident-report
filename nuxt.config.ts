// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: { preset: 'aws_amplify' },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tokens.css'],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        'https://7borjnekgb2x6fd5prto4m4uyy0ilhid.lambda-url.ap-northeast-1.on.aws',
      userPoolId: process.env.NUXT_PUBLIC_USER_POOL_ID || 'ap-northeast-1_IW2fJAMJP',
      userPoolClientId: process.env.NUXT_PUBLIC_USER_POOL_CLIENT_ID || '2rn5rvtlrgfi60bi3anll7aqbs',
      awsRegion: process.env.NUXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
    },
  },
});
