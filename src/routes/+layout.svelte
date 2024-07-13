<script lang="ts">
	import Github from '$lib/components/github.svelte';

	let { children } = $props();

	$effect(() => {
		detectSWUpdate();
	});

	async function detectSWUpdate() {
		const registration = await navigator.serviceWorker.ready;
		registration.addEventListener('updatefound', () => {
			const newSW = registration.installing;
			newSW?.addEventListener('statechange', () => {
				if (newSW.state === 'installed') {
					if (confirm('New update available. Reload?')) {
						window.location.reload();
					}
				}
			});
		});
	}
</script>

<div>
	<a href="https://github.com/naidraikzir/radiete">
		<Github />
	</a>
</div>

{@render children()}
