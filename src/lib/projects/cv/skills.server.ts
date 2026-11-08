// The skills, as the CV builder needs them: names and profiles, no icons, notes or
// evidence links (a CV for an applicant tracking system is plain text).
import { skillDataIn } from '#lib/skills/skills.server.ts';
import type { Locale } from '#lib/i18n/locales.ts';
import type { CvSkills } from './cv.ts';

// Strongest first: a recruiter reads the start of a line, and so does a parser. A
// skill without a level (a spoken language) goes last, with the first sentence of its
// note instead: "Native", "C1". In the page's language: the CV follows the site's.
export function cvSkillsIn(locale: Locale): CvSkills {
	const { profiles, groups } = skillDataIn(locale);
	return {
		profiles,
		groups: groups.map((group) => ({
			key: group.key,
			name: group.name,
			skills: group.skills
				.toSorted((a, b) => (b.level ?? 0) - (a.level ?? 0))
				.map(({ key, name, level, note, profiles }) => ({
					key,
					name,
					label: !level && note ? `${name} (${note.split('.')[0]})` : name,
					profiles
				}))
		}))
	};
}
