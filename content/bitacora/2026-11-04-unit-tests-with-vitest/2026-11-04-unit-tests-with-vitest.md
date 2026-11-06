---
title: My first unit tests, and the bug they found
date: 2026-11-04
phase: 9
tags: [testing, vitest, typescript]
---

## What we did

- Added Vitest 5.1 (`pnpm add -D vitest`), with `pnpm test` (run once) and `pnpm test:watch` (run again on every save).
- No new config file: Vitest reads `vite.config.ts`. It now imports `defineConfig` from `vitest/config` (Vite's, plus types for `test`) and has `test: { include: ['src/**/*.test.ts'] }`.
- `src/lib/content.test.ts`: 72 tests for `summary()`, `readingTime()` (now exported) and `checkTags()`, plus one per real Bitácora entry, checking each gets a description of 1 to 160 characters.
- The first run failed one test, and it was a real bug: a body starting with a code block got the code's first line as its summary. `summary()` now removes whole fenced blocks first.

## What I learned

- A **unit test** calls one small piece of code (a "unit", here a function) with an input I choose and checks the output. Pure functions (same input, same output, no side effects) are the easiest to test, which is why `content.ts` came first.
- The shape: `describe()` groups tests, `test()` is one case, `expect(value).toBe(expected)` is the check. Matchers I used: `toBe`, `toMatch` (a regex), `toBeLessThanOrEqual`, `toThrow` / `not.toThrow`.
- `toThrow` needs a **function** to call: `expect(() => checkTags(…)).toThrow()`. With `expect(checkTags(…))`, the error happens before `expect` even runs.
- `test.each([...])` runs the same test once per value, and `%s` puts the value in the name.
- The edge cases are where the bugs are: an empty file, a cut right after a comma, a code block first. The happy path already worked.
- Vitest runs through the same Vite config as the site, so `import.meta.glob` and `#lib/…` work in tests too. That's why the last test can read the real entries.
- A failing test says exactly what it expected and what it got: `expected 'const x = 1;' to be 'The text.'`.

## Problems & fixes

- `summary()` skipped the line with the opening fence but not the lines inside the block. The fix is one regex, ``/^(`{3,})[^\n]*\n[\s\S]*?^\1/gm``: `\1` is "as many backticks as the opening fence", so a four-backtick block with a three-backtick one inside goes whole.

## Links

- [Vitest: Getting started](https://vitest.dev/guide/)
- [Vitest: expect API](https://vitest.dev/api/expect.html)
- [Vitest: test.each](https://vitest.dev/api/#test-each)
- [Net Ninja: Unit Testing Crash Course (Vitest), YouTube](https://www.youtube.com/playlist?list=PL4cUxeGkcC9iyuClsf48SSgsJPBStHo7F)

## Next

- A Playwright smoke test: every nav link loads in the built site.
- Run `pnpm test` in CI, on every PR.
