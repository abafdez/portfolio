// The import rewriting the CMS preview and the demo frame share (blob-modules.ts).
import { describe, expect, test } from 'vitest';
import { rewriteImports } from './blob-modules.ts';

const urls = { svelte: 'blob:a', 'preview:components': 'blob:b', 'preview:snippet/abc': 'blob:c' };

describe('rewriteImports', () => {
	test('points the top imports at their URLs, even with a string export name first', () => {
		const code = `import { mount } from 'svelte';\nimport { 'compare-side' as C } from "preview:components";\nconst x = 1;`;
		expect(rewriteImports(code, urls)).toBe(
			`import { mount } from 'blob:a';\nimport { 'compare-side' as C } from "blob:b";\nconst x = 1;`
		);
	});

	test('leaves the same text alone further down (a code block in the post)', () => {
		const code = `import 'svelte';\nconst text = "import { x } from 'svelte';";`;
		expect(rewriteImports(code, urls)).toBe(
			`import 'blob:a';\nconst text = "import { x } from 'svelte';";`
		);
	});

	test('rewrites import("…") only for the names given (a demo that waits)', () => {
		const code = `import 'svelte';\nconst load = () => import("preview:snippet/abc");\nimport("svelte");`;
		expect(rewriteImports(code, urls, ['preview:snippet/abc'])).toBe(
			`import 'blob:a';\nconst load = () => import("blob:c");\nimport("svelte");`
		);
	});

	test("an import it can't answer throws, naming it", () => {
		expect(() => rewriteImports(`import x from './Button.svelte';`, urls)).toThrow(
			"The preview can't import ./Button.svelte"
		);
	});
});
