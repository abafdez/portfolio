// My changes to the skills, one set per profile: the mainframe CV can leave out what
// the web CV keeps. Kept in localStorage, like my details.
// Changes, not a copy of the list: a skill added to the YAML later still shows up, and
// "reset" is just forgetting the changes.
import type { CvGroup, CvSkill, CvSkills } from './cv.ts';
import { isObject, loadJson, saveJson, stringRecord, strings } from './storage.ts';

const key = 'cv-builder-skills';

// One of my own skills. The id stays the same when I reword or move it, so the order
// can point to it (its place in the list wouldn't: it changes when one before it goes).
export interface OwnSkill {
	id: string;
	text: string;
}

export interface ProfileEdits {
	// Skill names switched on that the YAML doesn't give this profile…
	on: string[];
	// …and ones it gives that are switched off.
	off: string[];
	// My wording, by skill name.
	labels: Record<string, string>;
	// My own skills, by group name.
	added: Record<string, OwnSkill[]>;
	// My order, by group name: skill names and own skill ids. Only for groups I've
	// reordered; anything not in it (a skill new to the YAML, one I just added) goes last.
	order: Record<string, string[]>;
}

// A row of a group, as the editor and the CV list it: a skill from the YAML or mine.
export type Item = { key: string; skill: CvSkill } | { key: string; own: OwnSkill };

const empty = (): ProfileEdits => ({ on: [], off: [], labels: {}, added: {}, order: {} });

// What get() returns for a profile with no changes. Only ever read: every write goes
// through #edit(), which makes the profile its own object first.
const none = empty();

// My own skills, as saved. The first version saved them as plain strings; those still
// load, with a new id each.
function ownSkills(value: unknown): OwnSkill[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((item) => {
		if (typeof item === 'string') return [{ id: crypto.randomUUID(), text: item }];
		if (isObject(item) && typeof item.id === 'string' && typeof item.text === 'string') {
			return [{ id: item.id, text: item.text }];
		}
		return [];
	});
}

// An object of lists, by group name, each list checked by read().
function byGroup<T>(value: unknown, read: (list: unknown) => T[]): Record<string, T[]> {
	if (!isObject(value)) return {};
	return Object.fromEntries(Object.entries(value).map(([group, list]) => [group, read(list)]));
}

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
			this.all[profile] = {
				on: strings(saved.on),
				off: strings(saved.off),
				labels: stringRecord(saved.labels),
				added: byGroup(saved.added, ownSkills),
				order: byGroup(saved.order, strings)
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
		this.all[profile] ??= empty();
		return this.all[profile];
	}

	included(skill: CvSkill, profile: string): boolean {
		const { on, off } = this.get(profile);
		return on.includes(skill.key) || (skill.profiles.includes(profile) && !off.includes(skill.key));
	}

	// Only a difference from the YAML is stored: switching a skill back to what the YAML
	// says removes it from on and off.
	include(skill: CvSkill, profile: string, value: boolean) {
		const edits = this.#edit(profile);
		edits.on = edits.on.filter((key) => key !== skill.key);
		edits.off = edits.off.filter((key) => key !== skill.key);
		if (value === skill.profiles.includes(profile)) return;
		(value ? edits.on : edits.off).push(skill.key);
	}

	label(skill: CvSkill, profile: string): string {
		return this.get(profile).labels[skill.key] ?? skill.label;
	}

	// The same wording as the YAML isn't a change, so it isn't stored. An empty one is
	// (while I'm typing), but the CV falls back to the YAML's.
	relabel(skill: CvSkill, profile: string, text: string) {
		const { labels } = this.#edit(profile);
		if (text === skill.label) delete labels[skill.key];
		else labels[skill.key] = text;
	}

	// A group's rows in my order: the ones I've placed first, as placed, then the rest
	// as they come (the YAML's skills strongest first, then mine).
	items(group: CvGroup, profile: string): Item[] {
		const edits = this.get(profile);
		const order = edits.order[group.key] ?? [];
		const rows: Item[] = [
			...group.skills.map((skill) => ({ key: skill.key, skill })),
			...(edits.added[group.key] ?? []).map((own) => ({ key: own.id, own }))
		];
		const rank = (row: Item) => {
			const index = order.indexOf(row.key);
			return index === -1 ? order.length + rows.indexOf(row) : index;
		};
		return rows.toSorted((a, b) => rank(a) - rank(b));
	}

	// Swap a row with the one above (by -1) or below (by 1). The whole order is stored,
	// so the group keeps it whatever is added later.
	move(group: CvGroup, profile: string, key: string, by: -1 | 1) {
		const keys = this.items(group, profile).map((row) => row.key);
		const from = keys.indexOf(key);
		const to = from + by;
		if (from === -1 || to < 0 || to >= keys.length) return;
		[keys[from], keys[to]] = [keys[to], keys[from]];
		this.#edit(profile).order[group.key] = keys;
	}

	// A new, empty skill of my own at the end of the group. Returns its id, so the editor
	// can put the focus in it.
	add(group: string, profile: string): string {
		const { added } = this.#edit(profile);
		const id = crypto.randomUUID();
		// Same as in #edit: push to added[group] as read back, the proxy.
		added[group] ??= [];
		added[group].push({ id, text: '' });
		return id;
	}

	rename(group: string, profile: string, id: string, text: string) {
		const own = this.#edit(profile).added[group]?.find((skill) => skill.id === id);
		if (own) own.text = text;
	}

	// Out of the order too. A group's list goes once it's empty: no [] left in storage.
	remove(group: string, profile: string, id: string) {
		const { added, order } = this.#edit(profile);
		added[group] = (added[group] ?? []).filter((skill) => skill.id !== id);
		if (!added[group].length) delete added[group];
		if (order[group]) order[group] = order[group].filter((key) => key !== id);
	}

	reset(profile: string) {
		delete this.all[profile];
	}

	// What the CV prints for a group: its rows in my order, the YAML's in my words (or
	// its own if I emptied mine), mine if they have text.
	printed(group: CvGroup, profile: string): string[] {
		return this.items(group, profile).flatMap((row) => {
			if ('own' in row) return row.own.text.trim() || [];
			if (!this.included(row.skill, profile)) return [];
			return this.label(row.skill, profile).trim() || row.skill.label;
		});
	}

	// The whole CV's skills for a profile. A group with nothing to print is dropped.
	groups({ groups }: CvSkills, profile: string) {
		return groups
			.map((group) => ({ name: group.name, skills: this.printed(group, profile) }))
			.filter((group) => group.skills.length);
	}
}
