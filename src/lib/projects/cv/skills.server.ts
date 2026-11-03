// The skills, as the CV builder needs them: names and profiles, no icons, notes or
// evidence links (a CV for an applicant tracking system is plain text).
import { skillData } from '#lib/skills/skills.server.ts';
import type { CvSkills } from './cv.ts';

// Strongest first: a recruiter reads the start of a line, and so does a parser. A
// skill without a level (a spoken language) goes last, with the first sentence of its
// note instead: "Native", "C1".
export const cvSkills: CvSkills = {
	profiles: skillData.profiles,
	groups: skillData.groups.map((group) => ({
		name: group.name,
		skills: group.skills
			.toSorted((a, b) => (b.level ?? 0) - (a.level ?? 0))
			.map(({ name, level, note, profiles }) => ({
				label: !level && note ? `${name} (${note.split('.')[0]})` : name,
				profiles
			}))
	}))
};
