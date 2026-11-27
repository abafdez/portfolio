// Our blocks (::video, ::yt; their fields and checks are in #lib/blocks.ts) as an mdsvex
// plugin. Each is a leaf directive drawn by our component (blocks/index.ts), its label
// as the label snippet and its arguments as props; checkBlock() fails the build on a
// wrong one, naming the file.
// A block's ./files can't become imports from here (a plugin can't add one), so their
// paths go into the post's plugin_data, and the page loads them (media.ts, +page.ts).
// The old syntax, a ```video fence, is claimed too, to fail the build with the new one.
import type { Bundle, DirectiveContext, NodeView, PluginContext } from 'mdsvex/compile';
import { blocks, checkBlock } from '#lib/blocks.ts';

const names = Object.keys(blocks);

function block(name: string) {
	return {
		parse: (node: NodeView, ctx: DirectiveContext) => () => {
			const file = ctx.filename ?? '';
			if (node.type !== 'directive_leaf')
				throw new Error(`${file}: ${name} takes a line of its own: ::${name}[…](…)`);
			const hasLabel = node.first_child?.type === 'directive_label';
			const values = checkBlock(name, node.attrs.args ?? {}, hasLabel, file);
			for (const [field, value] of Object.entries(values)) {
				if (blocks[name].fields[field].kind === 'file') ctx.add('files', value);
			}
			node.attrs.args = { ...values, file };
		}
	};
}

export const blocksPlugin: Bundle = {
	name: 'blocks',
	module: '/src/lib/markdown/blocks/index.ts',
	directives: Object.fromEntries(names.map((name) => [name, block(name)])),
	fences: names,
	parse: {
		code_fence: {
			parse(node: NodeView, ctx: PluginContext) {
				if (!node.lang || !names.includes(node.lang)) return;
				throw new Error(
					`${ctx.filename}: a \`\`\`${node.lang} block is a directive now: ::${node.lang}[…](…) (content/blog/posts/README.md)`
				);
			}
		}
	}
};
