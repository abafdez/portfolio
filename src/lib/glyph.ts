// An icon drawn from data, for things whose icon is chosen in content (an Awesome list's
// `icon:` or `logo:` in its YAML). Resolved on the server (glyph.server.ts), so the icon
// libraries stay on the build machine and a page gets only the icons it shows.
// - node: a Lucide icon's elements (stroked, Lucide's style);
// - path: a Simple Icons logo's path (filled), on a 24 × 24 grid.
export type Glyph = { node: [string, Record<string, string>][] } | { path: string };
