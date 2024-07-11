<script lang="ts">
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

{@render children()}
