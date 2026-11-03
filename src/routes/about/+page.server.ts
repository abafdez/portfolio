import { skillData } from '#lib/skills/skills.server.ts';
import type { PageServerLoad } from './$types';

// The skills, their icons as data, and each brand logo once (for the sprite).
export const load: PageServerLoad = () => skillData;
