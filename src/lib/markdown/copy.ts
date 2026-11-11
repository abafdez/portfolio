// The copy buttons of the code blocks in some HTML (CodeBlock.svelte), as an attachment
// for the element that holds it: <div {@attach copyCode}>{@html html}</div>.
// The buttons are in the HTML, hidden; this shows them if the browser can copy, and one
// click listener on the container serves them all (the HTML came from {@html}, so no
// Svelte handler is attached to anything in it).
import type { Attachment } from 'svelte/attachments';

export const copyCode: Attachment<HTMLElement> = (container) => {
	if (!('clipboard' in navigator)) return;
	for (const button of container.querySelectorAll<HTMLButtonElement>('button[data-copy]')) {
		button.hidden = false;
	}

	async function copy(event: MouseEvent) {
		const button = (event.target as Element).closest<HTMLButtonElement>('button[data-copy]');
		const figure = button?.closest('figure');
		const status = figure?.querySelector('[role="status"]');
		if (!button || !figure || !status) return;
		// textContent is the code as written: the line numbers are CSS (::before), so
		// they're not in it, and a wrapped line is still one line.
		const code = figure.querySelector('code')?.textContent ?? '';
		try {
			await navigator.clipboard.writeText(code);
			status.textContent = button.dataset.copied ?? '';
		} catch {
			status.textContent = button.dataset.failed ?? '';
		}
		setTimeout(() => (status.textContent = ''), 2000);
	}

	container.addEventListener('click', copy);
	return () => container.removeEventListener('click', copy);
};
