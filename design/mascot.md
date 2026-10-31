# Mascot — design brief

Phase 4.5, step 4. The site's mascot: an **original** character. Inspired by what Alfonso likes about Onsokumaru (a smug, cheeky attitude), but not a copy of it or any other existing character.

The source of truth is the SVG in [`src/lib/components/Mascot.svelte`](../src/lib/components/Mascot.svelte). Review sheet: `/mascot` (not in the nav). Renders from image models are for exploring ideas only; anything we keep gets redrawn in the SVG.

## The character

- **What it is:** a terminal block cursor that came alive. A chubby rounded-square body (a squircle, not a ball), stubby arms and feet, and a blinking cursor block on an antenna.
- **Attitude:** smug and cheeky. Half-closed lids, pupils glancing sideways, one eyebrow raised, a lopsided smirk with a dimple. It reacts to what you do (it tilts and raises the brow on hover).
- **Name:** to be decided. Ideas: _Blink_ (the cursor blinks), _Bit_, _Caret_.

## Palette

Same in both themes. A dark outline makes it a sticker on light backgrounds; on dark the green body carries it.

| Part              | Token            | Value                     |
| ----------------- | ---------------- | ------------------------- |
| Body              | `--mascot-body`  | phosphor green `#59ed7b`  |
| Outline, pupils   | `--mascot-ink`   | near-black blue `#091017` |
| Clothes           | `--mascot-cloth` | blue-gray `#505c69`       |
| Eye whites, shirt | `--mascot-light` | `#f6f9fb`                 |
| Blush             | `--mascot-blush` | soft pink                 |

## Costumes (one per section)

| Section  | Costume   | Notes                                   |
| -------- | --------- | --------------------------------------- |
| Home     | none      | antenna cursor blinking                 |
| CV       | `suit`    | jacket, white shirt V, dark tie         |
| Projects | `glasses` | thick square nerd frames                |
| Bitácora | `robe`    | peaked scribe hood and robe with a belt |
| Blog     | `beret`   | writer's beret, tilted                  |
| Awesome  | `shades`  | black pixel sunglasses                  |

Ideas for later: a quill for the bitácora, a coffee mug, a hard hat for "under construction" pages, a 404 look (glitched, sweating).

## Animation

Idle loops, only with `prefers-reduced-motion: no-preference`: a slow bob with a squashing shadow, a blink every 5 s, a brow raise every 7 s, the cursor blinking. Hover: a cheeky tilt. Planned: costume changes during view transitions between routes (step 5), and reactions to the theme toggle.

## Prompts for Nano Banana (concept renders)

Paste the base description, then one of the variations. Always keep the last line, so the model doesn't drift toward an existing character.

**Base description**

> An original cartoon mascot for a developer's portfolio: a chubby rounded-square creature (like a soft squircle, not a sphere) in bright phosphor green (#59ed7b), with a thick dark navy outline (#091017). It is a computer terminal's block cursor come to life: a small rectangular green cursor block floats on a short antenna on top of its head. Stubby rounded arms and two small feet. Face: smug, cheeky expression, half-closed eyelids, pupils glancing to the side, the right eyebrow raised, a lopsided smirk with a dimple, small pink blush on the cheeks. Clean flat vector style, sticker look, simple shapes. Original character design, not based on any existing character.

**Variations**

1. _Character sheet:_ "Front view, three-quarter view and side view, plus six expressions (smug, laughing, surprised, unimpressed, winking, sleepy), on a dark blue-gray blueprint grid background."
2. _Costumes:_ "Six versions side by side: no costume; a dark blue-gray business suit with a white shirt and dark tie; thick square nerd glasses; a peaked monk-style scribe hood and robe; a tilted beret; black pixel-art sunglasses."
3. _Poses:_ "Leaning on a giant keyboard key; peeking from behind a code editor window; typing on a tiny laptop; pointing at the viewer with a smirk."
4. _Style exploration:_ "Same character as a soft 3D vinyl toy render" / "as 16-bit pixel art" / "as a monochrome green CRT terminal ASCII drawing."
