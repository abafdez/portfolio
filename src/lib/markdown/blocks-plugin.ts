// Our fenced blocks (```video, ```yt; their fields and checks are in #lib/blocks.ts) as an
// mdsvex plugin. It claims their fences (the highlighter never sees them) and turns each
// one into a directive that mdsvex draws with our component (blocks/index.ts), the
// fields as props. readBlock() fails the build on a wrong field, naming the file.
// A block's ./files can't become imports from here (a plugin can't add one), so their
// paths go into the post's plugin_data, and the page loads them (media.ts, +page.ts).
import type { Bundle, NodeView, PluginContext } from 'mdsvex/compile';
import { blocks, readBlock } from '#lib/blocks.ts';

const names = Object.keys(blocks);

export const blocksPlugin: Bundle = {
	name: 'blocks',
	module: '/src/lib/markdown/blocks/index.ts',
	directives: Object.fromEntries(names.map((name) => [name, {}])),
	fences: names,
	parse: {
		code_fence: {
			parse(node: NodeView, ctx: PluginContext) {
				if (!node.lang || !names.includes(node.lang)) return;
				return () => {
					const file = ctx.filename ?? '';
					const { name, values } = readBlock(node.lang, node.text_content, file)!;
					// Props from a directive are strings; the components turn sizes back into numbers.
					const args: Record<string, string> = { file };
					for (const [field, value] of Object.entries(values)) {
						args[field] = String(value);
						if (blocks[name].fields[field].kind === 'file') ctx.add('files', String(value));
					}
					node.wrap_from('directive_leaf', { name, args }).close();
					node.remove();
				};
			}
		}
	}
};
