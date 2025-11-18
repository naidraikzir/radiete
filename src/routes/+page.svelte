<script lang="ts">
	import { metadataStore } from '$lib/stores/metadata.svelte';
	import { radioStore } from '$lib/stores/radio.svelte';
	import type { Radio } from '$lib/types';

	let modalRef: HTMLDialogElement;

	const initialForm = {
		url: '',
		name: ''
	};
	let form = $state({ ...initialForm });
	let editId = $state('');

	let playing = $state({
		id: '',
		name: '',
		url: ''
	});
	let error = $state('');

	$effect(() => {
		if (playing.url) {
			metadataStore?.subscribe();
		}
	});

	$effect(() => {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: metadataStore.nowPlaying.split(' - ')[1],
			artist: metadataStore.nowPlaying.split(' - ')[0]
		});
	});

	$effect(() => {
		const id = localStorage.getItem('playing');
		const radio = radioStore.radios.find((radio) => radio.id === id);
		if (radio) {
			playing = radio;
		}
	});

	function edit(radio: Radio) {
		const { id, ...rest } = radio;
		editId = id;
		form = rest;
		modalRef.showModal();
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (editId) {
			radioStore.update({ id: editId, ...form });
			editId = '';
		} else if (radioStore.radios.some((radio) => radio.url === form.url)) {
			alert('Radio exists. Please add different one!');
			return;
		} else {
			radioStore.add(form);
		}
		form = { ...initialForm };
		(document.activeElement as HTMLElement).blur();
		modalRef.close();
	}

	function confirmDelete(radio: Radio) {
		if (confirm('Delete? Really? Sure?')) {
			radioStore.remove(radio);
		}
	}

	function closeModal() {
		modalRef.close();
		form = { ...initialForm };
		editId = '';
	}

	function play(radio: Radio) {
		error = '';
		playing = radio;
		localStorage.setItem('playing', radio.id);
		metadataStore?.trackStream(playing.url);
	}

	function shuffle() {
		const currentIndex = radioStore.radios.findIndex((r) => r.id === playing.id);
		let nextIndex = currentIndex;
		while (nextIndex === currentIndex) {
			nextIndex = Math.floor(Math.random() * radioStore.radios.length);
		}
		play(radioStore.radios[nextIndex]);
	}

	function handleAudio(node: HTMLAudioElement, url: string) {
		if (url) setupAudioHandlers(node);
		return {
			update(url: string) {
				if (url) setupAudioHandlers(node);
			}
		};
	}

	async function setupAudioHandlers(node: HTMLAudioElement) {
		node.addEventListener('playing', async () => {
			navigator.mediaSession.setActionHandler('previoustrack', () => shuffle());
			navigator.mediaSession.setActionHandler('nexttrack', () => shuffle());
			// console.log((node as unknown as HTMLCanvasElement).captureStream());
		});
		node.play();
	}
</script>

<svelte:head>
	<title>{metadataStore.nowPlaying || playing.name || 'Radiete'}</title>
</svelte:head>

<center>
	{#if !!playing.url}
		<h3>{playing.name}</h3>
		<h4>{metadataStore.nowPlaying}</h4>
		<div>
			<audio
				crossorigin="anonymous"
				controls={!!playing.url}
				src={playing.url}
				onerror={(e) => (error = (e?.target as HTMLAudioElement)?.error?.message as string)}
				use:handleAudio={playing.url}
			></audio>
		</div>
		<div style="color: red;">
			<small>{error}</small>
		</div>
	{/if}

	<br />

	<p>
		<button onclick={() => modalRef.showModal()}>Add Station</button>
		{#if radioStore.radios.length > 0}
			<button onclick={() => radioStore.xport()}>Export</button>
			<button onclick={() => shuffle()}>🔀</button>
		{/if}

		{#if !radioStore.radios.length}
			<button onclick={() => radioStore.mport()}>Import</button>
		{/if}
	</p>
</center>

<ol style="max-width: 354px; margin: 0 auto;">
	{#each radioStore.radios as radio (radio.id)}
		<li>
			<h4>
				<button type="button" onclick={() => confirmDelete(radio)}>❌</button>
				<button type="button" onclick={() => edit(radio)}>✏️</button>
				&nbsp;
				{radio.name}
				&nbsp;
				{#if playing.url !== radio.url}
					<button type="button" onclick={() => play(radio)}>▶️</button>
				{/if}
			</h4>
		</li>
	{/each}
</ol>

<dialog bind:this={modalRef}>
	<form onsubmit={onSubmit}>
		<div>
			<label for="name">Name</label>
			<div>
				<input type="text" id="name" bind:value={form.name} required />
			</div>
		</div>
		<br />
		<div>
			<label for="url">Url</label>
			<div>
				<input type="url" id="url" pattern="https://.*" bind:value={form.url} required />
			</div>
		</div>
		<br />
		<button type="button" onclick={closeModal}>Cancel</button>
		{#if !editId}
			<button type="submit">Add</button>
		{:else}
			<button type="submit">Update</button>
		{/if}
	</form>
</dialog>
