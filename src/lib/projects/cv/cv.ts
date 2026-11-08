// The CV builder's skills: what content/skills.yaml says, cut down to what a CV
// prints (skills.server.ts). Only the skills come from the build; the personal details
// are typed into the page and stay in the browser (details.svelte.ts), and so do my
// edits to the skills (edits.svelte.ts).
import type { Profile } from '#lib/skills/skills.ts';

export interface CvSkill {
	// The skill's English name in the YAML: unique and the same in every language, so
	// it's the key my edits use (and edits saved before the site had languages still
	// match).
	key: string;
	// Its name in the page's language.
	name: string;
	// The name as the CV prints it: "Svelte", or "Spanish (Native)" for a skill without
	// a level.
	label: string;
	profiles: string[];
}

export interface CvGroup {
	// The group's English name: the key for my order and my own skills in it.
	key: string;
	name: string;
	// Strongest first.
	skills: CvSkill[];
}

export interface CvSkills {
	profiles: Profile[];
	groups: CvGroup[];
}
