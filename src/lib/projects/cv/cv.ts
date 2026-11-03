// The CV builder's skills: what content/skills.yaml says, cut down to what a CV
// prints (skills.server.ts). Only the skills come from the build; the personal details
// are typed into the page and stay in the browser (details.svelte.ts).
import type { Profile } from '#lib/skills/skills.ts';

export interface CvSkill {
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

// One profile's skills, by group. A group with none of them is dropped.
export function skillsFor({ groups }: CvSkills, profile: string) {
	return groups
		.map((group) => ({
			name: group.name,
			skills: group.skills.filter((skill) => skill.profiles.includes(profile))
		}))
		.filter((group) => group.skills.length);
}
