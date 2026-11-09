---
title: 'Plain text is never plain: UTF-8 in one post'
date: 2026-11-09
tags: [unicode, encoding, html]
description: Characters, code points and bytes are three different things. How UTF-8 turns one into the other, why "ñ" sometimes shows up as "Ã±", and what it means for HTML, CSS and JavaScript.
---

My toolbox has an HTML symbols table now, and every symbol in it lists its **UTF-8 bytes**: © is `C2 A9`, € is `E2 82 AC`, 😀 is `F0 9F 98 80`. Why does one character take two bytes, another three, another four? That's UTF-8, the encoding of 99.1% of the web ([W3Techs](https://w3techs.com/technologies/overview/character_encoding), November 2026), and it's worth understanding once.

If you'd rather watch than read, Dylan Beattie tells the whole story, from early British telegraphs to Danish spelling and Ukrainian number plates, in this talk:

```yt
src: https://www.youtube.com/watch?v=gd5uJ7Nlvvo
title: Plain Text, by Dylan Beattie (NDC Copenhagen 2022)
thumbnail: ./plain-text-talk.jpg
```

## Three things, not one

- A **character** is the idea: "the copyright sign".
- A **code point** is its number in Unicode: U+00A9 (169 in decimal). Unicode has room for 1,114,112 of them, from U+0000 to U+10FFFF.
- **Bytes** are how that number is stored or sent. An **encoding** is the rule that turns code points into bytes and back.

Unicode only hands out the numbers. UTF-8, UTF-16 and UTF-32 are three encodings of the same numbers.

## Before Unicode: one byte, many meanings

ASCII (1963) used 7 bits: 128 characters, enough for English. The eighth bit left 128 more places, and every region filled them differently. In Latin-1, byte `F1` is "ñ"; in a Cyrillic code page, the same byte is another letter entirely. A file didn't say which table it used, so the reader guessed.

That guess is where garbled text comes from, and it still happens. "ñ" in UTF-8 is two bytes, `C3 B1`. Read them as Latin-1, one byte per character, and you get `C3` = "Ã" and `B1` = "±": **"Ã±"**. The bytes are fine; the guess was wrong. There's a word for it, _mojibake_, Japanese for "character transformation".

## How UTF-8 works

UTF-8 (Ken Thompson and Rob Pike, 1992) uses 1 to 4 bytes per code point, and the first bits of each byte say what it is:

| Code points        | Bytes | Pattern                               |
| ------------------ | ----- | ------------------------------------- |
| U+0000 – U+007F    | 1     | `0xxxxxxx`                            |
| U+0080 – U+07FF    | 2     | `110xxxxx 10xxxxxx`                   |
| U+0800 – U+FFFF    | 3     | `1110xxxx 10xxxxxx 10xxxxxx`          |
| U+10000 – U+10FFFF | 4     | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` |

The `x`s are the code point's bits, filled in from the right. For © (U+00A9):

```text
A9 in binary:          1010 1001
11 bits for 2 bytes:   00010 101001
into the pattern:      110 00010   10 101001
in hex:                C2          A9
```

The design has some lovely properties:

- **ASCII is UTF-8.** The first 128 code points are one byte, the same byte as in ASCII, so every ASCII file is already a valid UTF-8 file.
- **You always know where you are.** A byte starting with `10` is a continuation; anything else starts a character. Jump into the middle of a file and you find the next character within three bytes.
- **No false ASCII.** Every byte of a multi-byte character has its top bit set, so a `/`, a `<` or a quote never appears inside one. Code that looks for those keeps working.

## The web: say it, early

A browser has to know the encoding before it reads the text, so the page says it, in its first 1024 bytes:

```html
<meta charset="utf-8" />
```

SvelteKit's `app.html` starts with it. A `Content-Type: text/html; charset=utf-8` header from the server says the same thing, and wins if the two disagree.

With UTF-8 declared, you can type © straight into HTML. Entities like `&copy;` are still handy for what's hard to type or to see: `&nbsp;`, `&ndash;`, and the characters HTML itself uses, `&lt;` and `&amp;`.

## JavaScript counts something else

JavaScript strings aren't UTF-8 inside: they're **UTF-16**, 16-bit units. Code points up to U+FFFF take one unit; anything above takes two, a _surrogate pair_. So `length` counts units, not characters:

```js
'©'.length; // 1
'😀'.length; // 2: D83D DE00
[...'😀'].length; // 1: spreading a string walks code points
'\u{1F600}' === '😀'; // true: \u needs braces above FFFF
```

That's why the symbols tool shows UTF-16 units too, and why it writes `\u{1F600}` for an emoji but `©` for ©. And `TextEncoder` is how you get from a JavaScript string to UTF-8 bytes, which is exactly what [Base64 needs](/blog/2026-11-09-base64-encodes-bytes-not-text).

## Links

- [Joel Spolsky: The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/) (2003, still true)
- [RFC 3629: UTF-8](https://www.rfc-editor.org/rfc/rfc3629)
- [MDN: `<meta charset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#charset)
- [W3C: Declaring character encodings in HTML](https://www.w3.org/International/questions/qa-html-encoding-declarations)
- [MDN: UTF-16 characters, Unicode code points, and grapheme clusters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters)
