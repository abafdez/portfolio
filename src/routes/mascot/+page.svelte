<script lang="ts">
	import Mascot, { type Costume } from '#lib/components/Mascot.svelte';

	// Review sheet for the mascot while it's designed (Phase 4.5, step 4). Not in the nav.
	const looks: { costume?: Costume; section: string }[] = [
		{ section: 'Home' },
		{ costume: 'suit', section: 'CV' },
		{ costume: 'glasses', section: 'Projects' },
		{ costume: 'robe', section: 'Bitácora' },
		{ costume: 'beret', section: 'Blog' },
		{ costume: 'shades', section: 'Awesome' }
	];
</script>

<svelte:head>
	<title>Mascot · AB</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Mascot</h1>
<ul>
	{#each looks as look (look.section)}
		<li>
			<Mascot costume={look.costume} />
			<p>{look.section}<br /><code>{look.costume ?? 'none'}</code></p>
		</li>
	{/each}
</ul>

<style>
	/* main shrinks to its content, so give the sheet its own width. */
	ul {
		inline-size: min(60rem, 100vw - var(--size-8));
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-6);
		padding: 0;
		list-style: none;
	}

	li {
		text-align: center;
	}

	p {
		margin-block-start: var(--size-2);
		font-family: var(--font-label);
		color: var(--text-2);
	}
</style>
