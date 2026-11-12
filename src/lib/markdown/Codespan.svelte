<script lang="ts">
	// `code` in a sentence. svelte-markdown's own renderer prints the raw markdown with
	// every backtick removed (raw.replace(/`/g, '')), so `` `a` `` lost its inner backticks
	// and kept the padding spaces. marked's token already has the code itself in `text`.
	let { text }: { text: string } = $props();
</script>

<code>{text}</code>
