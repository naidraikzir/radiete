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

	return {
		get radios() {
			return radios;
		},
		add,
		update,
		remove
	};
}
