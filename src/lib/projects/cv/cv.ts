// The CV builder's skills: what content/skills.yaml says, cut down to what a CV
// prints (skills.server.ts). Only the skills come from the build; the personal details
// are typed into the page and stay in the browser (details.svelte.ts), and so do my
// edits to the skills (edits.svelte.ts).
import type { Profile } from '#lib/skills/skills.ts';

export interface CvSkill {
	// The skill's name in the YAML: unique, so it's the key my edits use.
	name: string;
	// The name as the CV prints it: "Svelte", or "Spanish (Native)" for a skill without
	// a level.
	label: string;
	profiles: string[];
}

export interface CvSkills {
	profiles: Profile[];
	// Strongest first in each group.
	groups: { name: string; skills: CvSkill[] }[];
}
