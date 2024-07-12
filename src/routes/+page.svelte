<script lang="ts">
	import { createRadioStore } from '$lib/stores/radio.svelte';
	import type { Radio } from '$lib/types';

	const radioStore = createRadioStore();

	let modalRef: HTMLDialogElement;

	const initialForm = {
		url: '',
		name: ''
	};
	let form = $state({ ...initialForm });
	let editId = $state('');

	let playing = $state({
		name: '',
		url: ''
	});
	let error = $state('');

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
	}

	function shuffle() {
		const index = Math.floor(Math.random() * radioStore.radios.length);
		play(radioStore.radios[index]);
	}

	function handleAudio(node: HTMLAudioElement, url: string) {
		if (url) node.play();
		return {
			update(url: string) {
				if (url) node.play();
			}
		};
	}
</script>

<center>
	{#if !!playing.url}
		<h3>{playing.name}</h3>
		<div>
			<audio
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

<ol>
	{#each radioStore.radios as radio}
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
