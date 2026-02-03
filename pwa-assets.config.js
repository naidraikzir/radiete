import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	preset: {
		...preset,
		apple: {
			...preset.apple,
			resizeOptions: {
				background: 'transparent'
			}
		},
		maskable: {
			...preset.maskable,
			resizeOptions: {
				background: 'transparent'
			}
		}
	},
	images: ['static/favicon.svg']
});
