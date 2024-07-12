import { browser } from '$app/environment';
import type { NewRadio, Radio } from '$lib/types';

const KEY = 'radios';

export function createRadioStore() {
	let radios = $state<Radio[]>([]);

	if (browser) {
		const stored = localStorage.getItem(KEY);
		if (stored) radios = JSON.parse(stored);
	}

	$effect(() => {
		localStorage.setItem(KEY, JSON.stringify(radios));
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
			'radios',
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

	return {
		get radios() {
			return radios;
		},
		add,
		update,
		remove,
		xport
	};
}
