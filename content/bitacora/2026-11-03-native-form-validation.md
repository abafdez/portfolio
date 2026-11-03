---
title: Form validation with what the browser already has
date: 2026-11-03
phase: 5.5
tags: [forms, accessibility, css]
---

## What we did

- The CV form checks itself with no library: `required` on name, surnames, phone and email, `type="email"`, and a `pattern` for the phone (`\+?[0-9\s\(\)\-]{9,20}`) and the postal code.
- A field with a problem gets a red border (the new `--error` token) and a message under it. It's checked when I leave it, then on every keystroke until it's right.
- Print checks every field first: if something's wrong it says so and focuses the first bad field instead of printing. An import checks what it loaded.
- The fields are data now (`src/lib/projects/cv/inputs.ts`): label, type, autocomplete, required, pattern, hint. The form loops over them.
- `--error` is `--red-dark` / `--red-bright`: ≥ 5.74:1 in light and ≥ 7.45:1 in dark on every surface. The contrast checker lists it.

## What I learned

- The constraint validation API: every field has `validity`, one flag per problem (`valueMissing`, `typeMismatch`, `patternMismatch`…). `novalidate` on the form only stops the browser's bubbles; the fields still check themselves.
- My own messages, not `validationMessage`: that one comes in the browser's language.
- `focusout` bubbles (`blur` doesn't), so one handler on the form hears every field. CSS has the same "after you've touched it" rule as `:user-invalid`, but a text message needs JS.
- Color alone isn't enough: the message says what's wrong. It sits outside the `<label>` (inside, it would become part of the field's name), linked with `aria-describedby`. The border reacts to `aria-invalid`, so what's seen and what's heard can't disagree.
- Browsers compile `pattern` in the regex `v` mode, where `(`, `)` and `-` inside `[ ]` must be escaped. An invalid pattern is silently ignored.
- Svelte trims whitespace at the start of an element: `" *"` printed as `"*"`. A CSS margin instead.

## Links

- [MDN: constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation)
- [MDN: ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
- [MDN: :user-invalid](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid)
- [MDN: aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
- [MDN: pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern)

## Next

- Editing the skills for the selected profile: hide one, reword it, add my own. Kept in `localStorage` like my details.
