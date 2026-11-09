// Makes the cursors tool's sample GIF, src/lib/projects/toolbox/cursors/spinner.gif,
// from the same frames as the animated spinner (cursors.ts): our own drawing, so the
// GIF is ours to publish. Run it again if those frames change:
//
//   pnpm data:cursor-gif
//
// sharp draws each SVG frame at 32 × 32 and joins them as the frames of one animated
// GIF, each shown for the animation's interval, looping forever. GIF transparency is
// on or off per pixel, so the anti-aliased edges come out a little jagged: that's GIF.
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { animations, edgeFor } from '../src/lib/projects/toolbox/cursors/cursors.ts';

const color = '#50fa7b';
const { frames, interval } = animations.spinner;

const pngs = await Promise.all(
	frames(color, edgeFor(color)).map(({ body }) =>
		sharp(
			Buffer.from(
				`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>${body}</svg>`
			)
		)
			.png()
			.toBuffer()
	)
);

const gif = await sharp(pngs, { join: { animated: true } })
	.gif({ delay: pngs.map(() => interval), loop: 0 })
	.toBuffer();

const out = new URL('../src/lib/projects/toolbox/cursors/spinner.gif', import.meta.url);
writeFileSync(out, gif);
console.log(`${pngs.length} frames, ${interval} ms each, ${gif.length} bytes → ${out.pathname}`);
