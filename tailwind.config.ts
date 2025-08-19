import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.ts',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary) / <alpha-value>)',
        primaryDeep: 'rgb(var(--primary-deep) / <alpha-value>)',
        accent1: 'rgb(var(--accent1) / <alpha-value>)',
        accent2: 'rgb(var(--accent2) / <alpha-value>)',
        accent3: 'rgb(var(--accent3) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
