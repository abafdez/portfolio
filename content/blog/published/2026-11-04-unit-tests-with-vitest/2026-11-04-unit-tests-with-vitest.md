---
title: 'My first unit tests found a bug on the first run'
date: 2026-11-04
tags: [testing, vitest, typescript]
description: I'd never written a test. Adding Vitest to my SvelteKit site, testing three small functions, and the edge case that turned out to be a real bug.
cover: Test files flowing into a document with the Vitest logo.
---

I'd never written a test. My site had type checks (`pnpm check`) and a formatter (`pnpm lint`), and I looked at every change in the browser. That catches a lot, but not everything: a function can be typed right, formatted right, look fine on every page I open, and still be wrong for an input I never tried.

A **unit test** tries those inputs for me. It calls one small piece of code (a unit, usually a function) with an input I choose, and checks that the output is what I expect. Then it does that every time I run the tests, so a change that breaks it can't slip by.

## What to test first

The easiest code to test is a **pure function**: same input, same output, and it doesn't change anything outside itself. My `content.ts` has three:

- `summary(text)`: a one-line description from a markdown file (the first paragraph, as plain text, cut to 160 characters for search results);
- `readingTime(text)`: minutes to read, at 200 words a minute;
- `checkTags(path, tags)`: throws if a tag isn't lowercase kebab-case.

No browser, no network, no page: text in, value out. Perfect first tests.

## Setting up Vitest

[Vitest](https://vitest.dev/) is the test runner made for Vite, and my site is built with Vite. Installing it:

```sh
pnpm add -D vitest
```

There's no new config file. Vitest reads `vite.config.ts`, so I only told it where my tests are:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	// …plugins, as before
	test: {
		include: ['src/**/*.test.ts']
	}
});
```

`vitest/config` exports the same `defineConfig` as Vite, plus the types for `test`. And because the tests run through my real config, they import files exactly like the site does: `#lib/…` paths and `import.meta.glob` both work.

Two scripts in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

`vitest run` runs everything once (what CI will do). Plain `vitest` stays open and re-runs the tests whenever I save a file.

## The shape of a test

A test file sits next to the file it tests: `content.ts`, `content.test.ts`.

```ts
import { describe, expect, test } from 'vitest';
import { summary } from './content.ts';

describe('summary', () => {
	test('takes the first list item, without its marker', () => {
		expect(summary(file('## What we did\n\n- First bullet.\n- Second bullet.'))).toBe(
			'First bullet.'
		);
	});
});
```

- `describe()` groups tests under a name.
- `test()` is one case: a name that says what should happen, and a function.
- `expect(value)` plus a **matcher** is the check. `toBe` is "is exactly this". If it isn't, the test fails.

`file()` is a little helper of mine that wraps a body in frontmatter, so each test only writes the part it cares about.

A few other matchers I needed:

```ts
expect(result.length).toBeLessThanOrEqual(160);
expect(result).toMatch(/word…$/); // a regular expression
expect(() => checkTags('post.md', ['CSS'])).toThrow('tags must be lowercase');
```

That last one tripped me up. `toThrow` needs a **function** it can call and watch. If I write `expect(checkTags(…))`, `checkTags` throws before `expect` even starts, and the test crashes instead of passing.

## One test, many inputs

For tags, I wanted to try a lot of good and bad ones. `test.each` runs the same test once per value:

```ts
test.each(['CSS', 'design tokens', 'design--tokens', '-css', 'css-'])('rejects "%s"', (tag) => {
	expect(() => checkTags('post.md', [tag])).toThrow('post.md: tags must be lowercase');
});
```

`%s` puts the value in the test's name, so the report says exactly which one failed.

## Edge cases are where the bugs are

The first test (a normal bullet) passed straight away, of course: that's the case I'd been looking at in the browser all along. The useful tests are the strange inputs:

- an empty file;
- a text exactly long enough to be cut right after a comma (`one two,…` looks broken, so it should be `one two…`);
- a link, which should become just its text;
- a name with an underscore, like `page_data`, which must keep it;
- a body that **starts with a code block**.

That last one failed:

```text
FAIL  summary > skips a code block at the start, not just its fence
AssertionError: expected 'const x = 1;' to be 'The text.'
```

`summary()` skipped lines starting with three backticks, so it skipped the fence, then took the first line of code as the description. No Devlog entry starts with code yet, so nothing on the site showed it. The first one that did would have had `const x = 1;` as its search result.

The fix removes whole code blocks before looking for the first line:

```ts
const codeBlock = /^(`{3,})[^\n]*\n[\s\S]*?^\1/gm;
```

``(`{3,})`` captures the opening fence (three backticks or more), and `\1` means "the same thing again", so the block ends at a fence with as many backticks. A four-backtick block that shows a three-backtick one inside it goes whole too. And that got its own test.

## A test over the real content

The last test doesn't use made-up input. It reads my real Devlog entries and checks that each one gets a description of 1 to 160 characters:

```ts
test.each(allLog.map((entry) => [entry.slug, entry.description]))(
	'%s has a description of 1 to 160 characters',
	(_slug, description) => {
		expect(description.length).toBeGreaterThan(0);
		expect(description.length).toBeLessThanOrEqual(160);
	}
);
```

If I ever write an entry that starts with only a heading, this test names the file.

## Links

- [Vitest: Getting started](https://vitest.dev/guide/)
- [Vitest: expect API](https://vitest.dev/api/expect.html)
- [Vitest: test.each](https://vitest.dev/api/#test-each)
- [Net Ninja: Unit Testing Crash Course (Vitest)](https://www.youtube.com/playlist?list=PL4cUxeGkcC9iyuClsf48SSgsJPBStHo7F)
