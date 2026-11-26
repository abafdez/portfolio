# Cover images from our own GPU

Plan, 2026-11-26. 18 drafts wait for covers; making each one by hand is what holds them back. Goal: a cover in the house style in a few minutes per post, generated on Alfonso's own machine (no image API, no per-image cost, nothing sent to a third party).

## What a cover must be

- The house style of the 57 published covers: AI illustrations, dark navy background, glowing neon (cyan, orange, magenta), isometric UI pieces, often the title in big 3D letters plus a subtitle. Several are square art centred on a blurred, stretched copy of itself.
- The site's rules (CLAUDE.md, Folders): `cover.avif` (quality ≥ 70) in the post's folder, 16:9, at least 1600 × 900, **what matters in the middle** (cards crop a square from the centre), alt text as `cover:` in both the `.md` and the `.es.md` frontmatter.

## The machine

RTX 3080 Ti, **12 GB VRAM** (Ampere: no native FP8, so GGUF quantisations are the efficient choice), 32 GB RAM in Windows of which WSL gets 15 GB, 894 GB free in WSL, 1.1 TB on D:. `nvidia-smi` works inside WSL (driver 610.74), so CUDA is available there.

## Models (licences checked on Hugging Face, 2026-11-26)

| Model                                      | Licence                        | On 12 GB                                                       | Use                                                               |
| ------------------------------------------ | ------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Z-Image-Turbo** (Tongyi-MAI, 6B)         | Apache 2.0                     | fits (FP8 or GGUF weights), 8 steps                            | **first choice**: fast, good for iterating; text only short words |
| **Qwen-Image-2512** (Qwen, 20B)            | Apache 2.0                     | GGUF Q4–Q5 + text encoder partly in RAM; slow (minutes, guess) | best permissive text rendering: titles drawn by the model         |
| FLUX.2 [klein] 4B (Black Forest Labs)      | Apache 2.0                     | fits in BF16, 4 steps                                          | fallback / comparison                                             |
| ~~Qwen-Image-2.1~~                         | **qwen-research** (not Apache) |                                                                | avoid: comparison sites call it Apache, its model card doesn't    |
| ~~FLUX.2 [dev], [klein] 9B, FLUX.1 [dev]~~ | non-commercial                 |                                                                | avoid: a portfolio for job hunting is close enough to commercial  |

Re-check each licence on the model card at download time.

## Where ComfyUI runs: inside WSL

[ComfyUI](https://github.com/comfyanonymous/ComfyUI) (GPL-3.0; we only run it, never copy its code into the repo) installed in WSL with a Python venv, outside the repo (`~/comfyui`). Why WSL and not the Windows Desktop app:

- The scripts run from WSL and reach it at `127.0.0.1:8188`; Windows' browser reaches a WSL port on `localhost` out of the box, so Alfonso still gets the node UI.
- Claude can install, update and drive it without Windows-side steps.
- Cost: WSL's 15 GB RAM is tight for Qwen-Image's text encoder offload. **Alfonso:** raise it in `%UserProfile%\.wslconfig` (`[wsl2]` → `memory=24GB`), then `wsl --shutdown`. Not needed for Z-Image-Turbo.

Safety rules:

- Core ComfyUI plus **one** custom node, [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF) (for GGUF weights). No ComfyUI-Manager installs of other nodes: custom nodes are arbitrary Python and some have shipped malware.
- Weights only as `.safetensors` or `.gguf` from the model authors' or Comfy-Org's Hugging Face repos; never `.ckpt`/`.pt`/`.pth` (pickles run code).
- Listen on `127.0.0.1` only (the default). Pin ComfyUI to a release tag; update on purpose.

## The text in the picture

Two ways, decided after the first batch:

1. **The model draws the title** (Qwen-Image-2512, or Z-Image-Turbo for one or two words). Closest to the existing covers. Claude reads every candidate and rejects misspelt ones.
2. **Art without text + our own title overlay**: sharp composites an SVG title in the site's fonts. Always spelt right, could carry the Spanish title too, but looks flatter than the neon 3D letters.

## The workflow

```
pnpm cover <slug> [--model zimage|qwen] [--count 4]   → .covers/<slug>/1.png … 4.png  (gitignored)
(Alfonso picks one; or Claude shows a contact sheet)
pnpm cover:pick <slug> <n>                             → content/blog/posts/<slug>/cover.avif
Claude looks at it and writes cover: in .md and .es.md → pnpm content:format
```

Pieces:

- `design/covers/style.md`: the house style as prompt text, written by Claude from looking at the 57 covers (palette, lighting, composition, what to avoid), plus a negative prompt.
- `design/covers/prompts.yaml`: per post, `subject` (what the picture shows, 1–3 sentences), `title` and `subtitle` (the words on the cover). Not in the post folder: content globs pick up files there. Claude drafts these from each post; Alfonso edits.
- `scripts/comfy/<model>.json`: the workflow in ComfyUI's **API format** (built in the UI once, "Export (API)"), with placeholder values for prompt, seed, size.
- `scripts/cover.ts` (Node 24 runs it, like `scripts/serve.ts`): reads the post's frontmatter and its `prompts.yaml` entry, fills the workflow, `POST /prompt`, waits on `GET /history/<id>`, downloads with `GET /view`, one random seed per candidate (seed saved next to the file so a good one can be re-run bigger).
- `scripts/cover-pick.ts`: sharp → 16:9 at ≥ 1600 × 900. Native 16:9 sizes (e.g. 1664 × 928) need no work; square art gets the blurred-sides treatment the old covers have; AVIF quality 70.
- No new npm dependency: `fetch` is built in, sharp and `yaml` are already devDependencies.

## Steps

1. **Setup** (Claude): ComfyUI in WSL + ComfyUI-GGUF, Z-Image-Turbo weights. One test image at 1664 × 928; note time per image and peak VRAM.
2. **Style** (Claude, Alfonso approves): `style.md` from the old covers; 4 test covers for one draft; compare with the published ones side by side.
3. **Scripts**: `cover.ts`, `cover-pick.ts`, the workflow JSON, `.covers/` in `.gitignore`, a short section in `content/blog/posts/README.md` (the publishing guide).
4. **Qwen-Image-2512** (after the `.wslconfig` change): the same post with drawn titles; decide text option 1 or 2.
5. **The drafts**: prompts for all 18, generate, pick, alt texts; publish the ones Alfonso chooses (conditions in `.claude/drafts-to-publish.md`).
6. A Devlog entry and a draft post (covers from my own GPU), copied to the vault.

## Open for Alfonso

- The `.wslconfig` memory change (step 4).
- Pick from candidates himself, or let Claude pre-select from a contact sheet.
- Text option 1 or 2 (after step 4).
- Later: the same pipeline for Devlog entries, Awesome lists and section covers (CLAUDE.md lists them as planned).
