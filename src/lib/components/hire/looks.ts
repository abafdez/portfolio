// The looks of the hire panel's top card (Footer.svelte). The panel shows the next one
// each time it opens, starting from a random one. Each loads only when it's shown.
// A new look is a component here and a line.
import type { Component } from 'svelte';
import type { Picture } from '@sveltejs/enhanced-img';

export interface LookProps {
	photo: Picture;
	linkedin: string;
	github: string;
}

export const looks: { id: string; load: () => Promise<{ default: Component<LookProps> }> }[] = [
	{ id: 'terminal', load: () => import('./Terminal.svelte') },
	{ id: 'spotlight', load: () => import('./Spotlight.svelte') },
	{ id: 'card', load: () => import('./BusinessCard.svelte') },
	{ id: 'open', load: () => import('./OpenToWork.svelte') },
	{ id: 'id-card', load: () => import('./IdCard.svelte') }
];
