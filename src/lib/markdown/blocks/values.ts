// What the block components (Video, Yt) need from blocks.ts, in a file of its own: they
// run in the browser, and blocks.ts brings a YAML parser only the build and the CMS use.

// The yt card's last line, in the file's language.
export const watchOnYoutube = {
	en: 'Watch on YouTube · opens in a new tab',
	es: 'Ver en YouTube · se abre en una pestaña nueva'
};

// The video's id from any of YouTube's link shapes: youtube.com/watch?v=ID,
// youtu.be/ID, youtube.com/shorts/ID, /embed/ID, /live/ID.
export function youtubeId(src: string): string | undefined {
	let url: URL;
	try {
		url = new URL(src);
	} catch {
		return;
	}
	const host = url.hostname.replace(/^(www|m)\./, '');
	const id =
		host === 'youtu.be'
			? url.pathname.slice(1)
			: host === 'youtube.com'
				? (url.searchParams.get('v') ??
					url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1])
				: undefined;
	return id && /^[\w-]{11}$/.test(id) ? id : undefined;
}

// One link shape for every video, keeping a start time (?t=90) if the link had one.
export function youtubeUrl(src: string) {
	const url = new URL(`https://www.youtube.com/watch?v=${youtubeId(src)}`);
	const start = new URL(src).searchParams.get('t');
	if (start) url.searchParams.set('t', start);
	return url.href;
}

export function videoType(file: string) {
	return file.endsWith('.webm') ? 'video/webm' : 'video/mp4';
}
