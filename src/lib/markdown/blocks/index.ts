// The component that draws each fenced block in blocks.ts (```video, ```yt). Each one
// gets the block's fields, checked by readBlock(), plus the post's file and media.ts.
// A test checks every block has one.
import type { Component } from 'svelte';
import Video from './Video.svelte';
import Yt from './Yt.svelte';

export const components: Record<string, Component<any>> = { video: Video, yt: Yt };
