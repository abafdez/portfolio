---
title: Form validation without a library
date: 2026-11-03
tags: [forms, accessibility]
description: The browser already knows when a field is required, isn't an email or doesn't match a pattern. I only had to decide when to say so, and in which words.
cover: A form with name, email and password fields, each marked as validated.
---

My CV builder's form needed validation: a CV without a name or an email isn't one. I didn't add a library. HTML already has `required`, `type="email"` and `pattern`, and every field reports what it thinks of its value in `field.validity`.

## The browser decides

```ts
export function problem(field: HTMLInputElement): string {
	if (field.validity.valid) return '';
	if (field.validity.valueMissing) return 'Required.';
	return inputs.find(({ name }) => name === field.name)?.hint ?? field.validationMessage;
}
```

`validity` has one flag per kind of problem. I write my own messages instead of using `validationMessage`, because that one comes in the browser's language, and my page is in English.

`novalidate` on the form turns off the browser's bubbles. The fields still check themselves.

## When to say it

Red while you're still typing your email is rude. So a field is first checked when you leave it, with one `focusout` handler on the form (it bubbles; `blur` doesn't). From then on it's checked on every keystroke, so the message goes the moment the value is right. CSS has this exact rule built in, `:user-invalid`, but I needed the message as text, so it's JS.

## Not only red

A red border means nothing to someone who can't tell red apart. Each problem also gets a message, outside the `<label>` (inside, it would become part of the field's name), linked with `aria-describedby`. The border reacts to `aria-invalid="true"`, the same attribute a screen reader hears:

```css
[aria-invalid='true'] {
	border-color: var(--error);
	box-shadow: inset 0 0 0 1px var(--error);
}
```

The shadow makes the border look twice as thick without moving anything.

## One trap: patterns in v mode

The obvious phone pattern is `[0-9 ()-]`. But browsers compile `pattern` with the regex `v` flag, where `(`, `)` and `-` inside `[ ]` must be escaped, and an invalid pattern is silently ignored: the field would accept anything. The one I use:

```
\+?[0-9\s\(\)\-]{9,20}
```
