import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    printWidth: 80,
    semi: false,
    singleQuote: true,
    experimentalSortImports: {},
  },
  staged: {
    '*.{ts,svelte}': [
      'vp lint --type-aware',
      'vp fmt --no-error-on-unmatched-pattern',
    ],
  },
  plugins: [sveltekit()],
})
