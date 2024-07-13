import { createMetadataClient, type MetadataClient } from '@radiolise/metadata-client';

function createMetadataStore() {
	let metadataClient = $state<MetadataClient>();
	let nowPlaying = $state('');

	const cleanup = $effect.root(() => {
		$effect(() => {
			metadataClient = createMetadataClient({
				url: 'wss://backend.radiolise.com/api/data-service'
			});
		});

		return () => {
			cleanup();
		};
	});

	function trackStream(url: string) {
		metadataClient?.trackStream(url);
	}

	function subscribe(callback: (title: string) => void) {
		return metadataClient?.subscribe(({ title, error }) => {
			if (!error) {
				nowPlaying = title;
				callback(title);
			}
		});
	}

	return {
		get nowPlaying() {
			return nowPlaying;
		},
		trackStream,
		subscribe
	};
}

export const metadataStore = createMetadataStore();
