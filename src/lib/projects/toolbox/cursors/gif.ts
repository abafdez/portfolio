// GIFs as animated cursors. A GIF used as a cursor shows only its first frame (Firefox's
// bug about it has been open since 2009), so here it's split into frames in the
// browser and the frames are swapped like any other animated cursor (cursors.ts).
// ImageDecoder (WebCodecs) does the splitting: it hands back each frame already
// composed, whatever the GIF's disposal tricks. Safari doesn't have it yet; there the
// page says so and the GIF stays still.

export interface Frame {
	// A value for `cursor`: the frame as a PNG data URL, its hotspot, a fallback.
	cursor: string;
	// How long it shows, in milliseconds, as the GIF says.
	duration: number;
}

export const canSplit = () => typeof ImageDecoder !== 'undefined';

// Big enough for any sensible cursor GIF, small enough that decoding stays quick.
export const maxBytes = 2 * 1024 * 1024;
export const maxFrames = 120;

// Every frame, scaled to fit 32 × 32 (the size cursors should be) and centred, with
// the hotspot in the middle. A GIF without timings gets 100 ms a frame; browsers
// treat very short delays as 100 ms too, but 20 ms is kept as the floor here.
export async function splitGif(data: ArrayBuffer | Blob, size = 32): Promise<Frame[]> {
	const decoder = new ImageDecoder({
		data: data instanceof Blob ? data.stream() : data,
		type: 'image/gif'
	});
	await decoder.tracks.ready;
	const count = Math.min(decoder.tracks.selectedTrack?.frameCount ?? 1, maxFrames);
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const context = canvas.getContext('2d')!;
	const frames: Frame[] = [];
	for (let frameIndex = 0; frameIndex < count; frameIndex++) {
		const { image } = await decoder.decode({ frameIndex });
		const scale = Math.min(1, size / Math.max(image.displayWidth, image.displayHeight));
		const width = Math.round(image.displayWidth * scale);
		const height = Math.round(image.displayHeight * scale);
		context.clearRect(0, 0, size, size);
		context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
		frames.push({
			cursor: `url("${canvas.toDataURL('image/png')}") ${size / 2} ${size / 2}, auto`,
			duration: Math.max(20, (image.duration ?? 100_000) / 1000)
		});
		image.close();
	}
	decoder.close();
	return frames;
}

// Plays the frames on an element while the pointer is over it, each for its own
// duration (setTimeout, not setInterval: GIF frames can each last a different time).
// The frames come through a function, so a new GIF doesn't tear the attachment down.
// With reduced motion, the first frame only.
export const playFrames = (frames: () => Frame[], still: () => boolean) => (node: HTMLElement) => {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let frame = 0;
	const show = () => {
		const list = frames();
		if (!list.length) return;
		node.style.cursor = list[frame % list.length].cursor;
		if (!still()) timer = setTimeout(show, list[frame++ % list.length].duration);
	};
	const start = () => {
		frame = 0;
		show();
	};
	const stop = () => clearTimeout(timer);
	node.addEventListener('pointerenter', start);
	node.addEventListener('pointerleave', stop);
	return () => {
		stop();
		node.removeEventListener('pointerenter', start);
		node.removeEventListener('pointerleave', stop);
	};
};
