// What I know, grouped, for /about. Data apart from the page, like projects.ts.
// The levels are a first pass from my CV; each one is a claim, so review them.
import { resolve } from '$app/paths';
import type { LucideIcon } from '@lucide/svelte';
import type { SimpleIcon } from 'simple-icons';
import {
	siAutohotkey,
	siBlender,
	siClaude,
	siCss,
	siDavinciresolve,
	siDeno,
	siDocker,
	siFreecad,
	siGit,
	siGithubactions,
	siGoogle,
	siGrafana,
	siGraphql,
	siHtml5,
	siInkscape,
	siJavascript,
	siJira,
	siLaravel,
	siLighthouse,
	siMarkdown,
	siMysql,
	siNodedotjs,
	siNotion,
	siObsidian,
	siObsstudio,
	siPhp,
	siPnpm,
	siPocketbase,
	siPostcss,
	siPostgresql,
	siPuppeteer,
	siPython,
	siSqlite,
	siSupabase,
	siSvelte,
	siTailwindcss,
	siTampermonkey,
	siTypescript,
	siUnrealengine,
	siVite,
	siVuedotjs,
	siWordpress
} from 'simple-icons';
// One file per icon: importing from '@lucide/svelte' itself would load all 2,000 in dev.
import Accessibility from '@lucide/svelte/icons/accessibility';
import Activity from '@lucide/svelte/icons/activity';
import Bot from '@lucide/svelte/icons/bot';
import Clapperboard from '@lucide/svelte/icons/clapperboard';
import CodeXml from '@lucide/svelte/icons/code-xml';
import Globe from '@lucide/svelte/icons/globe';
import BookOpen from '@lucide/svelte/icons/book-open';
import Boxes from '@lucide/svelte/icons/boxes';
import Camera from '@lucide/svelte/icons/camera';
import Code from '@lucide/svelte/icons/code';
import Database from '@lucide/svelte/icons/database';
import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
import FileText from '@lucide/svelte/icons/file-text';
import GitPullRequest from '@lucide/svelte/icons/git-pull-request';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import HardDrive from '@lucide/svelte/icons/hard-drive';
import Languages from '@lucide/svelte/icons/languages';
import Layers from '@lucide/svelte/icons/layers';
import Music from '@lucide/svelte/icons/music';
import Network from '@lucide/svelte/icons/network';
import Palette from '@lucide/svelte/icons/palette';
import Plug from '@lucide/svelte/icons/plug';
import ScanEye from '@lucide/svelte/icons/scan-eye';
import Server from '@lucide/svelte/icons/server';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import PenLine from '@lucide/svelte/icons/pen-line';
import SquareTerminal from '@lucide/svelte/icons/square-terminal';
import Swatches from '@lucide/svelte/icons/swatch-book';
import Wand from '@lucide/svelte/icons/wand-sparkles';
import Workflow from '@lucide/svelte/icons/workflow';
import Wrench from '@lucide/svelte/icons/wrench';

// How well I know it. Words, not percentages: "73% CSS" means nothing.
export const levels = {
	1: 'Learning',
	2: 'Comfortable',
	3: 'Daily',
	4: 'Could teach it'
} as const;
export type Level = keyof typeof levels;

// Where a skill shows on this site (or off it). One key per kind of page, so each
// href is built by resolve() with its own route, and TypeScript checks the params.
export type Evidence = { label: string } & (
	| { entry: string } // a Bitácora entry: /bitacora/<slug>
	| { tool: string } // a project: /projects/<tool>
	| { list: string } // an Awesome list: /awesome/<list>
	| { url: `https://${string}` }
);

export interface Skill {
	name: string;
	// A brand logo (Simple Icons) or a generic one (Lucide) when there's no logo.
	icon?: SimpleIcon | LucideIcon;
	// No level for things a level doesn't fit (spoken languages say it in the note).
	level?: Level;
	// How I use it, in one line.
	note?: string;
	evidence?: Evidence[];
}

export interface Group {
	name: string;
	// Next to the heading. Always a generic one: a group isn't a brand.
	icon: LucideIcon;
	// For the heading's id and the "on this page" nav.
	id: string;
	skills: Skill[];
}

// Built when the page renders, not here: under a base path, resolve() gives a
// different (relative) href on each prerendered page.
export function evidenceHref(evidence: Evidence): string {
	if ('entry' in evidence) return resolve('/bitacora/[slug]', { slug: evidence.entry });
	if ('tool' in evidence) return resolve('/projects/[tool]', { tool: evidence.tool });
	if ('list' in evidence) return resolve('/awesome/[list]', { list: evidence.list });
	return evidence.url;
}

const repo = 'https://github.com/abafdez/portfolio';

export const groups: Group[] = [
	{
		name: 'Languages',
		id: 'languages',
		icon: CodeXml,
		skills: [
			{
				name: 'HTML',
				icon: siHtml5,
				level: 3,
				note: 'Semantic markup first: landmarks, headings in order, native elements before ARIA.',
				evidence: [
					{ label: 'Lighthouse accessibility check', entry: '2026-10-29-lighthouse-a11y-check' }
				]
			},
			{
				name: 'CSS',
				icon: siCss,
				level: 3,
				note: 'Modern CSS: cascade layers, container queries, light-dark(), scroll-driven animations.',
				evidence: [
					{ label: 'Cascade layers', entry: '2026-10-29-cascade-layers' },
					{
						label: 'Scroll-driven header and footer',
						entry: '2026-10-31-scroll-driven-header-footer'
					},
					{ label: 'My Modern CSS list', list: 'modern-css' }
				]
			},
			{
				name: 'JavaScript',
				icon: siJavascript,
				level: 3,
				note: 'Websites for small businesses since 2010, and userscripts to automate the boring parts.',
				evidence: [
					{ label: 'A theme toggle without a flash', entry: '2026-10-29-theme-toggle-no-flash' }
				]
			},
			{
				name: 'TypeScript',
				icon: siTypescript,
				level: 2,
				note: 'This site, migrated from JSDoc: typed content, routes and data.',
				evidence: [
					{ label: 'Migrating to TypeScript', entry: '2026-10-21-typescript-migration' },
					{ label: 'The contrast checker', tool: 'contrast' }
				]
			},
			{
				name: 'PHP',
				icon: siPhp,
				level: 3,
				note: 'Freelance websites with PHP and MySQL since 2010.'
			},
			{
				name: 'Python',
				icon: siPython,
				level: 2,
				note: 'Web scraping to compare supplier prices and automate rate updates.'
			},
			{ name: 'SQL', icon: Database, level: 3, note: 'MySQL, PostgreSQL and SQLite.' }
		]
	},
	{
		name: 'Web development',
		id: 'web',
		icon: Globe,
		skills: [
			{
				name: 'Svelte and SvelteKit',
				icon: siSvelte,
				level: 2,
				note: 'This site: Svelte 5 runes, prerendered SvelteKit on GitHub Pages.',
				evidence: [
					{ label: 'A composition per route', entry: '2026-10-31-route-composition' },
					{ label: 'Filters in a $state class', entry: '2026-11-02-awesome-list-filters' },
					{ label: 'Source code', url: repo }
				]
			},
			{ name: 'Vue', icon: siVuedotjs, level: 1 },
			{ name: 'Laravel', icon: siLaravel, level: 2 },
			{ name: 'WordPress', icon: siWordpress, level: 3, note: 'Sites for small businesses.' },
			{ name: 'Node.js', icon: siNodedotjs, level: 2 },
			{ name: 'Deno', icon: siDeno, level: 1 },
			{ name: 'Tailwind CSS', icon: siTailwindcss, level: 2 },
			{
				name: 'PostCSS and Open Props',
				icon: siPostcss,
				level: 2,
				evidence: [{ label: 'Open Props with JIT', entry: '2026-10-22-open-props-jit-setup' }]
			},
			{
				name: 'Markdown and mdsvex',
				icon: siMarkdown,
				level: 3,
				note: 'This Bitácora and the blog, with my own code highlighting theme.',
				evidence: [
					{ label: 'Markdown with mdsvex', entry: '2026-10-31-markdown-with-mdsvex' },
					{ label: 'A Shiki theme from my tokens', entry: '2026-11-02-shiki-code-theme' }
				]
			},
			{ name: 'Static sites (Jamstack) and PWAs', icon: Layers, level: 2 },
			{ name: 'GraphQL', icon: siGraphql, level: 1 },
			{ name: 'Supabase', icon: siSupabase, level: 1 },
			{ name: 'PocketBase', icon: siPocketbase, level: 1 }
		]
	},
	{
		name: 'Databases',
		id: 'databases',
		icon: Database,
		skills: [
			{ name: 'MySQL', icon: siMysql, level: 3, note: 'Behind most of my freelance sites.' },
			{ name: 'SQLite', icon: siSqlite, level: 2 },
			{ name: 'PostgreSQL', icon: siPostgresql, level: 2 }
		]
	},
	{
		name: 'Mainframe',
		id: 'mainframe',
		icon: Server,
		skills: [
			{
				name: 'Natural and NaturalONE',
				icon: SquareTerminal,
				level: 1,
				note: 'Software AG certificate (Essential and Basic).'
			},
			{
				name: 'Adabas',
				icon: Database,
				level: 1,
				note: 'Software AG certificate (Essential and Basic).'
			},
			{
				name: 'COBOL',
				icon: Code,
				level: 1,
				note: 'IBM Z Xplore (Concepts and Intermediate).'
			},
			{ name: 'JCL', icon: FileText, level: 1, note: 'IBM Z Xplore (Concepts and Intermediate).' },
			{
				name: 'z/OS and USS',
				icon: Server,
				level: 1,
				note: 'IBM Z Xplore (Concepts and Intermediate).'
			},
			{ name: 'IBM AS/400', icon: Server, level: 2, note: 'Invoicing with an ERP on AS/400.' }
		]
	},
	{
		name: 'Tools',
		id: 'tools',
		icon: Wrench,
		skills: [
			{
				name: 'Git and GitHub',
				icon: siGit,
				level: 3,
				note: 'A branch and a pull request per feature, checked by CI before merging.',
				evidence: [{ label: 'Source code', url: repo }]
			},
			{
				name: 'GitHub Actions',
				icon: siGithubactions,
				level: 2,
				evidence: [{ label: 'Checks on every pull request', entry: '2026-10-20-ci-pr-checks' }]
			},
			{ name: 'VS Code', icon: Code, level: 3 },
			{ name: 'Vite', icon: siVite, level: 2 },
			{ name: 'pnpm', icon: siPnpm, level: 2 },
			{ name: 'Docker', icon: siDocker, level: 2 },
			{
				name: 'Lighthouse',
				icon: siLighthouse,
				level: 2,
				evidence: [{ label: 'A contrast regression', entry: '2026-10-29-contrast-regression' }]
			},
			{ name: 'Playwright', icon: ScanEye, level: 1 },
			{ name: 'Puppeteer', icon: siPuppeteer, level: 2 },
			{ name: 'Grafana', icon: siGrafana, level: 1 },
			{ name: 'Jira', icon: siJira, level: 2 },
			{ name: 'Notion', icon: siNotion, level: 3 },
			{ name: 'Obsidian', icon: siObsidian, level: 3, note: 'My notes and project boards.' },
			{
				name: 'AutoHotkey',
				icon: siAutohotkey,
				level: 3,
				note: 'Desktop automation: price comparisons and repetitive data entry.'
			},
			{
				name: 'Tampermonkey',
				icon: siTampermonkey,
				level: 3,
				note: 'Userscripts that add what a web app is missing.'
			}
		]
	},
	{
		name: 'Ways of working',
		id: 'methods',
		icon: Workflow,
		skills: [
			{
				name: 'Accessibility (WCAG)',
				icon: Accessibility,
				level: 2,
				note: 'Every page checked with Lighthouse in both themes, and contrast checked as tokens change.',
				evidence: [
					{ label: 'The contrast checker', tool: 'contrast' },
					{ label: 'Lighthouse accessibility check', entry: '2026-10-29-lighthouse-a11y-check' }
				]
			},
			{
				name: 'Design tokens and theming',
				icon: Swatches,
				level: 2,
				evidence: [
					{ label: 'Semantic tokens', entry: '2026-10-27-semantic-tokens' },
					{ label: 'Dark mode with light-dark()', entry: '2026-10-29-dark-mode-light-dark' }
				]
			},
			{
				name: 'Progressive enhancement',
				icon: Layers,
				level: 2,
				note: 'Pages work without JS; effects are extras and respect reduced motion.',
				evidence: [{ label: 'Drafts only in dev', entry: '2026-11-02-drafts-only-in-dev' }]
			},
			{
				name: 'Pull requests and CI',
				icon: GitPullRequest,
				level: 2,
				evidence: [{ label: 'Checks on every pull request', entry: '2026-10-20-ci-pr-checks' }]
			},
			{
				name: 'Learning in public',
				icon: BookOpen,
				level: 3,
				note: 'A dev log entry for every topic I learn.',
				evidence: [{ label: 'The learning path', entry: '2026-10-20-learning-path' }]
			},
			{
				name: 'Automation and web scraping',
				icon: Workflow,
				level: 3,
				note: 'Supplier rates and price comparisons with Python, Tampermonkey and AutoHotkey.'
			},
			{
				name: 'Data protection',
				icon: ShieldCheck,
				level: 2,
				note: 'Certified; I looked after a customer database under GDPR.'
			},
			{
				name: 'Training people',
				icon: GraduationCap,
				level: 3,
				note: 'Taught staff office and productivity tools.'
			}
		]
	},
	{
		name: 'AI workflows',
		id: 'ai',
		icon: Bot,
		skills: [
			{
				name: 'Claude Code',
				icon: siClaude,
				level: 3,
				note: 'Project rules, skills and agents in the repo; it writes a step, explains it, then quizzes me.',
				evidence: [{ label: 'The .claude folder', url: `${repo}/tree/main/.claude` }]
			},
			{
				name: 'MCP servers',
				icon: Plug,
				level: 2,
				note: 'Svelte docs and a Playwright browser, so the AI checks its own work.'
			},
			{
				name: 'Writing context for AI',
				icon: FileText,
				level: 2,
				note: 'CLAUDE.md files and skills: the rules and the steps, written once.'
			},
			{
				name: 'An AI-run knowledge base',
				icon: siObsidian,
				level: 2,
				note: 'Claude keeps my Obsidian vault: notes, boards and this dev log.'
			},
			{ name: 'ComfyUI', icon: Wand, level: 1, note: 'Image generation workflows.' }
		]
	},
	{
		name: 'Systems and support',
		id: 'systems',
		icon: Network,
		skills: [
			{
				name: 'Local networks',
				icon: Network,
				level: 3,
				note: 'Designed and set up for small businesses.'
			},
			{ name: 'Hardware repair and support', icon: Wrench, level: 4 },
			{ name: 'Virtualization', icon: Boxes, level: 2 },
			{
				name: 'Google Workspace',
				icon: siGoogle,
				level: 3,
				note: 'Moved an order system onto it.'
			},
			{ name: 'Microsoft Office', icon: FileSpreadsheet, level: 3 },
			{
				name: 'Telemetry and data analysis',
				icon: Activity,
				level: 2,
				note: 'Five years in GT racing: car telemetry, and the data to tune the setup at each track.'
			},
			{ name: 'System migrations', icon: HardDrive, level: 3 }
		]
	},
	{
		name: 'Multimedia and 3D',
		id: 'multimedia',
		icon: Clapperboard,
		skills: [
			{ name: 'Adobe Creative Suite', icon: Palette, level: 2 },
			{ name: 'DaVinci Resolve', icon: siDavinciresolve, level: 2 },
			{ name: 'Blender', icon: siBlender, level: 2 },
			{ name: 'Unreal Engine', icon: siUnrealengine, level: 1 },
			{ name: 'FreeCAD', icon: siFreecad, level: 1 },
			{ name: 'Agisoft Metashape', icon: ScanEye, level: 1, note: 'Photogrammetry.' },
			{ name: 'Inkscape', icon: siInkscape, level: 2 },
			{ name: 'OBS', icon: siObsstudio, level: 2 },
			{ name: 'FL Studio', icon: Music, level: 1 },
			{ name: 'Product photography', icon: Camera, level: 3, note: 'Catalogue photos for shops.' }
		]
	},
	{
		name: 'Languages I speak',
		id: 'spoken',
		icon: Languages,
		skills: [
			{ name: 'Spanish', icon: Languages, note: 'Native.' },
			{
				name: 'English',
				icon: Languages,
				note: 'C1. Six months studying in Manchester.'
			},
			{
				name: 'Translation and SEO writing',
				icon: PenLine,
				level: 2,
				note: 'Translated and wrote web content, SEO included.'
			}
		]
	}
];
