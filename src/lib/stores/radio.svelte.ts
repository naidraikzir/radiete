import { browser } from '$app/environment';
import type { NewRadio, Radio } from '$lib/types';

const KEY = 'radios';

export function createRadioStore() {
	let radios = $state<Radio[]>([]);

	if (browser) {
		const stored = localStorage.getItem(KEY);
		if (stored) radios = JSON.parse(stored);
	}

	const cleanup = $effect.root(() => {
		$effect(() => {
			localStorage.setItem(KEY, JSON.stringify(radios));
		});

		return () => {
			cleanup();
		};
	});

	function add(radio: NewRadio) {
		radios.push({
			...radio,
			id: crypto.randomUUID()
		});
	}

	function update(radio: Radio) {
		const index = radios.findIndex((r) => r.id === radio.id);
		radios[index] = radio;
	}

	function remove(radio: Radio) {
		radios = radios.filter((r) => r.id !== radio.id);
	}

	function xport() {
		const now = new Date();
		const filename = [
			'radiete',
			`${now.getFullYear()}`,
			`${now.getMonth() + 1}`,
			`${now.getDate()}`,
			`${now.getHours()}`,
			`${now.getMinutes()}`,
			`${now.getSeconds()}`
		]
			.join('_')
			.concat('.json');
		const blob = new Blob([JSON.stringify(radios)], { type: 'text/json' });
		const link = document.createElement('a');

		link.download = filename;
		link.href = window.URL.createObjectURL(blob);
		link.dataset.downloadurl = ['text/json', link.download, link.href].join(':');

		const evt = new MouseEvent('click', {
			view: window,
			bubbles: true,
			cancelable: true
		});

		link.dispatchEvent(evt);
		link.remove();
	}

	async function mport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e: Event) => {
			const files = (e.target as HTMLInputElement).files;
			const file = files?.length ? files[0] : null;
			if (file) {
				const reader = new FileReader();
				reader.onload = (e: ProgressEvent<FileReader>) => {
					try {
						const list = JSON.parse(e.target?.result as string);
						if (list.every((l: NewRadio) => l.name && l.url)) {
							radios = list.map(({ id, name, url }: Radio) => ({
								id: id || crypto.randomUUID(),
								name,
								url
							}));
						}
					} catch {
						alert('Please select a valid exported file');
					}
				};
				reader.readAsText(file);
			}
			input.remove();
		};
		input.click();
	}

	return {
		get radios() {
			return radios;
		},
		add,
		update,
		remove,
		xport,
		mport
	};
}

export const radioStore = createRadioStore();
