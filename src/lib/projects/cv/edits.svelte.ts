// My changes to the skills, one set per profile: the mainframe CV can leave out what
// the web CV keeps. Kept in localStorage, like my details.
// Changes, not a copy of the list: a skill added to the YAML later still shows up, and
// "reset" is just forgetting the changes.
import type { CvSkill, CvSkills } from './cv.ts';
import { isObject, loadJson, saveJson, stringRecord, strings } from './storage.ts';

const key = 'cv-builder-skills';

export interface ProfileEdits {
	// Skill names switched on that the YAML doesn't give this profile…
	on: string[];
	// …and ones it gives that are switched off.
	off: string[];
	// My wording, by skill name.
	labels: Record<string, string>;
	// My own skills, by group name.
	added: Record<string, string[]>;
}

// What get() returns for a profile with no changes. Only ever read: every write goes
// through #edit(), which makes the profile its own object first.
const none: ProfileEdits = { on: [], off: [], labels: {}, added: {} };

export class SkillEdits {
	all: Record<string, ProfileEdits> = $state({});

	#profiles: string[];

	constructor(profiles: string[]) {
		this.#profiles = profiles;
	}

	load() {
		this.read(loadJson(key));
	}

	save() {
		saveJson(key, this.all);
	}

	// Each profile's edits, checked piece by piece; anything else is dropped. Returns
	// how many profiles it took.
	read(data: unknown): number {
		if (!isObject(data)) return 0;
		let count = 0;
		for (const profile of this.#profiles) {
			const saved = data[profile];
			if (!isObject(saved)) continue;
			const added = isObject(saved.added) ? saved.added : {};
			this.all[profile] = {
				on: strings(saved.on),
				off: strings(saved.off),
				labels: stringRecord(saved.labels),
				added: Object.fromEntries(
					Object.entries(added).map(([group, list]) => [group, strings(list)])
				)
			};
			count++;
		}
		return count;
	}

	// For reading (the page reads it while it renders, so this mustn't write).
	get(profile: string): ProfileEdits {
		return this.all[profile] ?? none;
	}

	// For writing: the profile's edits, made the first time something changes.
	// Read back from this.all, not the value of ??=: that's the plain object we passed
	// in, and changes to it wouldn't be seen. this.all[profile] is the $state proxy.
	#edit(profile: string): ProfileEdits {
		this.all[profile] ??= { on: [], off: [], labels: {}, added: {} };
		return this.all[profile];
	}

	included(skill: CvSkill, profile: string): boolean {
		const { on, off } = this.get(profile);
		return (
			on.includes(skill.name) || (skill.profiles.includes(profile) && !off.includes(skill.name))
		);
	}

	// Only a difference from the YAML is stored: switching a skill back to what the YAML
	// says removes it from on and off.
	include(skill: CvSkill, profile: string, value: boolean) {
		const edits = this.#edit(profile);
		edits.on = edits.on.filter((name) => name !== skill.name);
		edits.off = edits.off.filter((name) => name !== skill.name);
		if (value === skill.profiles.includes(profile)) return;
		(value ? edits.on : edits.off).push(skill.name);
	}

	label(skill: CvSkill, profile: string): string {
		return this.get(profile).labels[skill.name] ?? skill.label;
	}

	// The same wording as the YAML isn't a change, so it isn't stored. An empty one is
	// (while I'm typing), but the CV falls back to the YAML's.
	relabel(skill: CvSkill, profile: string, text: string) {
		const { labels } = this.#edit(profile);
		if (text === skill.label) delete labels[skill.name];
		else labels[skill.name] = text;
	}

	added(group: string, profile: string): string[] {
		return this.get(profile).added[group] ?? [];
	}

	add(group: string, profile: string) {
		const { added } = this.#edit(profile);
		// Same as in #edit: push to added[group] as read back, the proxy.
		added[group] ??= [];
		added[group].push('');
	}

	rename(group: string, profile: string, index: number, text: string) {
		this.#edit(profile).added[group][index] = text;
	}

	// The group's list goes too once it's empty: no [] left behind in storage.
	remove(group: string, profile: string, index: number) {
		const { added } = this.#edit(profile);
		added[group].splice(index, 1);
		if (!added[group].length) delete added[group];
	}

	reset(profile: string) {
		delete this.all[profile];
	}

	// What the CV prints for a profile: each group's skills in the YAML's order (strongest
	// first), in my words, then mine. A group left empty is dropped.
	groups({ groups }: CvSkills, profile: string) {
		return groups
			.map((group) => ({
				name: group.name,
				skills: [
					...group.skills
						.filter((skill) => this.included(skill, profile))
						.map((skill) => this.label(skill, profile).trim() || skill.label),
					...this.added(group.name, profile)
						.map((text) => text.trim())
						.filter(Boolean)
				]
			}))
			.filter((group) => group.skills.length);
	}
}
