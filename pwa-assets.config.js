import {
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...preset,
    apple: {
      ...preset.apple,
      resizeOptions: {
        background: '#000',
      },
    },
    maskable: {
      ...preset.maskable,
      resizeOptions: {
        background: '#000',
      },
    },
  },
  images: ['static/favicon.svg'],
})
