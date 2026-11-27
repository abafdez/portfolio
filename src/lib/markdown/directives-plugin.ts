// Our own directives as an mdsvex plugin bundle; their components are in directives/.
//   :kbd[Ctrl+B]                    keycaps (the text becomes the `keys` prop)
//   :::details[Summary](open=true)  a collapsible section, summary required
//   :::compare                      panels side by side, one per heading inside,
//                                   like the tabs and steps plugins split theirs
// Mistakes fail the build, naming the file and line, like the parse plugins (plugins.ts).
import type { Bundle, DirectiveContext, NodeView } from 'mdsvex/compile';

const where = (node: NodeView, ctx: DirectiveContext) =>
	`${ctx.filename}:${node.position?.start.line ?? '?'}`;

export const directivesPlugin: Bundle = {
	name: 'site-directives',
	module: '/src/lib/markdown/directives/index.ts',
	directives: {
		kbd: {
			// Props are strings, and the component needs the text to split it into keys.
			parse: (node) => () => {
				node.attrs.args = { ...node.attrs.args, keys: node.text_content };
			}
		},
		details: {
			parse: (node, ctx) => () => {
				if (node.first_child?.type !== 'directive_label')
					throw new Error(`${where(node, ctx)}: :::details needs a summary: :::details[Show it]`);
			}
		},
		compare: {
			parse: (node, ctx) => () => {
				if ((ctx.state.sides ?? 0) < 2)
					throw new Error(
						`${where(node, ctx)}: :::compare needs two headings or more inside, one per side`
					);
			},
			children: {
				// Each heading of the first heading's depth starts a side, labelled by it.
				heading(node, ctx) {
					const state = ctx.state;
					state.level ??= node.depth;
					if (node.depth !== state.level) return;
					state.side?.close();
					state.side = node.wrap_from('directive_container', { name: 'compare-side' });
					node.wrap_from('directive_label').close();
					state.sides = (state.sides ?? 0) + 1;
				},
				'*'(node, ctx) {
					if (ctx.state.level === undefined)
						throw new Error(
							`${where(node, ctx)}: a :::compare starts with a heading (## Before), one per side`
						);
				}
			}
		},
		'compare-side': {}
	}
};
