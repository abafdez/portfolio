// The Shiki theme for code blocks (used in vite.config.ts at build time).
// A TextMate theme maps scopes (the grammar's names for each piece of code, like
// 'string' or 'entity.name.function') to colors. Here every color is a CSS variable
// from tokens.css, so code follows the site theme, and future named or user themes
// only need to override those variables.
// A selector matches a scope and everything under it ('constant' matches
// 'constant.numeric.css'); when several match, the longest one wins.
import type { ThemeRegistration } from 'shiki';

export const codeTheme: ThemeRegistration = {
	name: 'tokens',
	fg: 'var(--code-foreground)',
	bg: 'var(--code-background)',
	settings: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: 'var(--code-comment)' }
		},
		{
			// Operators (= => ! ?) are muted like punctuation: the words matter more.
			scope: ['punctuation', 'meta.brace', 'keyword.operator'],
			settings: { foreground: 'var(--code-punctuation)' }
		},
		{
			scope: [
				'keyword',
				'storage',
				'punctuation.definition.keyword',
				// ${ } in template strings, { } around Svelte expressions.
				'punctuation.definition.template-expression',
				'punctuation.section.embedded'
			],
			settings: { foreground: 'var(--code-keyword)' }
		},
		{
			scope: ['string', 'punctuation.definition.string'],
			settings: { foreground: 'var(--code-string)' }
		},
		{
			scope: ['entity.name.function', 'support.function', 'entity.name.command'],
			settings: { foreground: 'var(--code-function)' }
		},
		{
			// Numbers, true/false, CSS units, values and hex colors, escapes like \.
			scope: [
				'constant',
				'support.constant',
				'keyword.other.unit',
				'punctuation.definition.constant',
				'entity.other.attribute-name'
			],
			settings: { foreground: 'var(--code-constant)' }
		},
		{
			// Types and components, and the names on the left of "name: value":
			// CSS properties and custom properties, JSON and YAML keys.
			scope: [
				'entity.name.type',
				'entity.other.inherited-class',
				'support.type',
				'support.class',
				'variable.css',
				'variable.argument.css',
				'entity.name.tag.yaml'
			],
			settings: { foreground: 'var(--code-type)' }
		},
		{
			scope: ['entity.name.tag'],
			settings: { foreground: 'var(--code-tag)' }
		}
	]
};
