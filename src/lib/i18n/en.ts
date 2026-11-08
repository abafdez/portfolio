// The UI's English text. Every message is a function, plain text too, so a message
// with a value in it (a count, a name) is called the same way: m.blogTitle(),
// m.tagPostCount({ count }). Named by where they're used, then what they are.
// es.ts must have the same messages with the same parameters (it checks with satisfies).
// Content (posts, entries, the skills and the Awesome lists) isn't here: it's
// translated next to its own data.
import { plural } from './locales.ts';

type Count = { count: number };
type Name = { name: string };

export const en = {
	// The language switch (Header): what a link to this language says, and its
	// accessible name, both written in this language, since that's who it's for.
	languageShort: () => 'EN',
	languageSwitch: () => 'Read in English',

	// The site's sections: the nav, the breadcrumbs and the <title>s.
	navLabel: () => 'Main navigation',
	navHome: () => 'Home',
	navBlog: () => 'Blog',
	navAwesome: () => 'Awesome',
	navProjects: () => 'Projects',
	navAbout: () => 'About',
	navDevlog: () => 'Devlog',
	breadcrumbLabel: () => 'Breadcrumb',
	sectionNavLabel: () => 'On this page',
	footerRights: () => 'All rights reserved.',
	themeDark: () => 'Dark theme',
	themeLight: () => 'Light theme',
	paletteLabel: () => 'Color theme',
	paletteCredit: ({ name, by }: Name & { by: string }) => `${name} by ${by}`,

	// Cards, posts and code blocks.
	tagsLabel: () => 'Tags',
	minutesRead: ({ minutes }: { minutes: number }) => `${minutes} min read`,
	statusDraft: () => 'draft',
	statusPublished: () => 'published',
	// TranslationStatus: text shown in another language than the page's (only ever
	// English, on a Spanish page), and a translation not reviewed yet (dev only).
	inEnglish: () => 'in English',
	unreviewed: () => 'not reviewed',
	codeCopy: () => 'copy',
	codeCopied: () => 'copied',
	codeCopyFailed: () => "couldn't copy",

	// Home.
	homeTagline: () =>
		'Web developer. I make websites that are fast, accessible and a little playful.',
	homeAboutMe: () => 'About me',
	homeSeeProjects: () => 'See projects',
	homeReadBlog: () => 'Read the blog',
	homeLatestPosts: () => 'Latest posts',
	homeNoPosts: () => "No posts yet. They'll show up here once the blog is live.",
	homeLogIntro: () => 'Short notes from building this site, step by step.',
	homeNoEntries: () => 'No entries yet.',
	homeFeaturedProjects: () => 'Featured projects',
	homeNoProjects: () => 'No projects yet. Featured work will appear here.',

	// Blog.
	blogTitle: () => 'Blog',
	blogDescription: () => 'Longer articles about what I learn building this site.',
	blogEmpty: () => 'No posts yet. The first ones are on their way.',
	blogTagsTitle: () => 'Browse by tag',
	// TagCloud: the hidden end of "#css 26", read as "#css, 26 posts".
	tagPostCount: ({ count }: Count) => plural('en', count, { one: ' post', other: ' posts' }),
	tagCloudMore: ({ count }: Count) => `All ${count} tags`,
	tagCloudLess: () => 'Fewer tags',
	tagDescription: ({ tag }: { tag: string }) => `My posts tagged #${tag}, newest first.`,
	tagAllPosts: () => '← All posts',
	tagIntro: ({ count }: Count) =>
		plural('en', count, { one: '1 post with this tag.', other: `${count} posts with this tag.` }),

	// Devlog.
	devlogTitle: () => 'Devlog',
	devlogDescription: () => 'Short notes from building this site, step by step, newest first.',
	devlogPhase: ({ phase }: { phase: string }) => `Phase ${phase}`,
	devlogOther: () => 'Other',

	// Awesome.
	awesomeTitle: () => 'Awesome',
	awesomeDescription: () =>
		'Curated lists of links I keep going back to, each one searchable by tag.',
	awesomeLists: () => 'Lists',
	awesomeLinkCount: ({ count }: Count) =>
		plural('en', count, { one: '1 link', other: `${count} links` }),
	awesomeUpdated: () => 'updated',
	awesomeSearch: () => 'Search',
	awesomeShown: ({ count, total }: Count & { total: number }) => `${count} of ${total} links`,
	awesomeClear: () => 'Clear filters',
	awesomeEmpty: () => 'No links match. Try fewer words or tags.',

	// Projects.
	projectsTitle: () => 'Projects',
	projectsDescription: () => 'Small tools, each one a self-contained app.',
	projectsTools: () => 'Tools',

	// About.
	aboutTitle: () => 'About',
	aboutDescription: () =>
		'What I work with: languages, frameworks, tools, ways of working and AI workflows.',
	aboutHeading: () => 'About me',
	aboutLead: () =>
		"More than 15 years making technology work for small businesses: networks, hardware, automation and websites. I studied web development, I'm certified in mainframe Natural, Adabas and COBOL, and I'm now going deep on the modern front end, learning in public on this site.",
	aboutCvOnRequest: () => 'Want my full CV? I send it on request.',
	aboutAskLinkedIn: () => 'Ask on LinkedIn',
	aboutShowSkillsFor: () => 'Show skills for',
	aboutEverything: () => 'Everything',
	aboutSkillCount: ({ count, total }: Count & { total: number }) => `${count} of ${total} skills`,
	aboutCvTitle: () => 'Want my full CV?',
	aboutCvText: () =>
		"It has the dates, the companies and the details. Send me a message and I'll send it.",
	// A skill's level, in words: "73% CSS" means nothing.
	skillLevel: ({ level }: { level: 1 | 2 | 3 | 4 }) =>
		({ 1: 'Learning', 2: 'Comfortable', 3: 'Daily', 4: 'Could teach it' })[level],
	skillWindowCollapse: () => 'collapse',
	skillWindowExpand: () => 'expand',
	skillWindowMore: ({ count }: Count) => `+${count} more`,

	// The contrast checker.
	contrastText: () => 'Text',
	contrastSurface: () => 'Surface',
	contrastSample: () => 'The quick brown fox jumps over the lazy dog.',
	contrastAllPairs: () => 'All pairs',
	contrastNote: () =>
		'AA needs 4.5:1 for body text, AAA 7:1. "large" passes for large text only (3:1).',
	contrastLevel: ({ level }: { level: 'AAA' | 'AA' | 'large' | 'fail' }): string => level,
	contrastNoJs: () => "The ratios show up once the page's JavaScript has read the tokens.",

	// The CV builder. The CV it prints is in the page's language too.
	cvJob: () => 'Job',
	cvProfile: () => 'Profile',
	cvAboutYou: () => 'About you',
	cvRequiredNote: () => '* required',
	cvLetter: () => 'Short letter',
	cvSkills: () => 'Skills',
	cvSkillsOnCv: ({ count }: Count) => `${count} on the CV`,
	cvFieldsToFix: ({ count }: Count) =>
		plural('en', count, { one: '1 field to fix', other: `${count} fields to fix` }),
	cvRequiredLeft: ({ count }: Count) =>
		plural('en', count, {
			one: '1 required field left',
			other: `${count} required fields left`
		}),
	cvSavedNote: () =>
		"Saved in this browser only. Nothing you type here is sent anywhere. Export your details to keep a copy: clearing the browser's data deletes them.",
	cvNeedsJs: () => 'The builder needs JavaScript.',
	cvYourCv: () => 'Your CV',
	cvPrint: () => 'Print or save as PDF',
	cvExport: () => 'Export details',
	cvImport: () => 'Import details',
	cvTip: () =>
		"Tip: you can also type straight into the CV for a last-minute change before printing. It isn't saved, and any change in the form starts the CV over.",
	cvFixFirst: () => 'Some fields need fixing first.',
	cvLoaded: ({ count, profiles, file }: Count & { profiles: number; file: string }) =>
		`Loaded ${plural('en', count, { one: '1 field', other: `${count} fields` })} and skill edits for ${plural('en', profiles, { one: '1 profile', other: `${profiles} profiles` })} from ${file}.`,
	cvNoFields: ({ file }: { file: string }) => `No CV fields in ${file}.`,
	cvNotJson: ({ file }: { file: string }) => `${file} isn't a JSON file.`,
	cvYourName: () => 'Your name',
	cvSummary: () => 'Summary',
	// The form's fields (inputs.ts) and their messages.
	cvFieldName: () => 'Name',
	cvFieldSurnames: () => 'Surnames',
	cvFieldPhone: () => 'Phone',
	cvFieldEmail: () => 'Email',
	cvFieldCity: () => 'City',
	cvFieldState: () => 'State',
	cvFieldPostalCode: () => 'Postal code',
	cvRequired: () => 'Required.',
	cvPhoneHint: () => 'Digits, spaces and + ( ) -, at least 9.',
	cvEmailHint: () => 'An address like name@example.com.',
	cvPostalCodeHint: () => '3 to 10 digits or letters.',
	// The skill editor.
	cvEditorIntro: () =>
		'Untick a skill to leave it out of this CV, change its wording, move it with ↑ ↓, or add your own.',
	cvEditorScope: ({ profile }: { profile: string }) => `Only for ${profile}, only in this browser.`,
	cvNewSkill: () => 'your new skill',
	cvMoved: ({
		name,
		place,
		total,
		group
	}: Name & { place: number; total: number; group: string }) =>
		`${name}: ${place} of ${total} in ${group}.`,
	cvOnCv: ({ name }: Name) => `${name} on the CV`,
	cvWording: ({ name }: Name) => `Wording for ${name}`,
	cvOwnSkill: ({ group }: { group: string }) => `Your skill in ${group}`,
	cvMoveUp: ({ name }: Name) => `Move ${name} up`,
	cvMoveDown: ({ name }: Name) => `Move ${name} down`,
	cvRemove: ({ name }: Name) => `Remove ${name}`,
	cvAddSkill: () => 'Add a skill',
	cvAddSkillTo: ({ group }: { group: string }) => ` to ${group}`,
	cvReset: ({ profile }: { profile: string }) => `Reset the skills for ${profile}`
};

export type Messages = typeof en;
