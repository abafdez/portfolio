---
title: Base64 encodes bytes, not text
date: 2026-11-09
phase: 8.5
tags: [encoding, browser-apis, testing]
---

## What we did

- The toolbox's first tool, Base64 (`/projects/toolbox/base64`): text ↔ Base64 as UTF-8, with a URL-safe option (base64url), and a file → data URL with its size, a preview for images and a CSS snippet. Every output has a copy button.
- Wrote it anew instead of porting Omatsuri's. Its worker called `btoa()` on the text itself, and for an SVG it posted two results (no `else` between the SVG branch and the general one).
- The logic is in `base64.ts` with 19 unit tests (`base64.test.ts`); the form is `Base64.svelte`.
- Switching from Encode to Decode takes the output along as the new input, so "ñ" comes back.
- Decoding forgives what people paste: spaces, line breaks, base64url, missing `=` and a whole data URL.
- Files up to 2 MB. Bigger ones get a message: a data URL is for icons, not photos.

## What I learned

- Base64 turns bytes into text, 3 bytes into 4 characters (a third bigger). Text first has to become bytes, and on the web that's UTF-8 (`TextEncoder`).
- `btoa()` doesn't take text: it takes a "binary string", one character per byte (codes 0–255). `btoa('ñ')` gives `8Q==`, its Latin-1 byte, not the UTF-8 `w7E=`, and `btoa('😀')` throws.
- `new TextDecoder('utf-8', { fatal: true })` throws on bytes that aren't UTF-8 instead of turning them into "�". That's how the tool tells "not Base64" from "Base64, but not text" (the start of a PNG).
- `Uint8Array.prototype.toBase64()` would skip the binary string, but neither Node 22 (CI) nor 24 has it yet.
- A file input stretched over its label with `opacity: 0` gets clicks and dropped files natively: no drop code, one `change` handler.
- `FileReader` is already async, so the page doesn't freeze while it reads: no worker needed for small files.

## Links

- [MDN: Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64)
- [MDN: `btoa()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa)
- [MDN: `TextDecoder` `fatal`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/fatal)
- [RFC 4648: base64url](https://www.rfc-editor.org/rfc/rfc4648#section-5)

## Next

- Step 2: keyboard events.
