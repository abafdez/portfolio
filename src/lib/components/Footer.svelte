<script lang="ts">
	import { profiles } from '#lib/links.ts';
</script>

<footer>
	<div class="inner">
		<p><small>&copy; {new Date().getFullYear()} Alfonso Baeza. All rights reserved.</small></p>
		<ul>
			{#each profiles as profile (profile.label)}
				<li><a href={profile.url}>{profile.label}</a></li>
			{/each}
		</ul>
	</div>
</footer>

<style>
	footer {
		border-block-start: var(--border-size-1) solid var(--surface-3);
		color: var(--text-2);
	}

	.inner {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--size-2) var(--size-4);
		max-inline-size: var(--content-width);
		margin-inline: auto;
		padding: var(--size-4) var(--size-3);
	}

	ul {
		display: flex;
		gap: var(--size-4);
		padding: 0;
		list-style: none;
	}
</style>
