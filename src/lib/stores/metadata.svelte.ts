import { wait } from '$lib/utils';
import {
	createMetadataClient,
	type MetadataClient,
	type NowPlayingInfo
} from '@radiolise/metadata-client';

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

	async function trackStream(url: string) {
		metadataClient?.trackStream('');
		await wait(2000);
		nowPlaying = '';
		await metadataClient?.trackStream(url);
	}

	function subscribe() {
		return metadataClient?.subscribe(setMetadata);
	}

	function setMetadata({ title, error }: NowPlayingInfo) {
		if (!error) {
			nowPlaying = title;
		}
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
