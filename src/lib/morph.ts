// Cards that turn into the page they open: the title, the picture, the date line, the
// description and the tags fly from the card to their places in the page's header (and
// back again when you return to the list). Run from the root layout's onNavigate.
//
// How: a view transition morphs two elements into each other when they have the same
// view-transition-name, one before the change and one after. Names must be unique on a
// page, so they aren't on every card all the time: only the card (or header) marked
// data-morphing has them, during a "morph" transition (the CSS is in global.css).
//
// The markup (TeaserCard, ArticleHeader, ProjectHeader, an Awesome list's header):
// - data-morph-card: a card, around its parts;
// - data-morph-page: a page's header, around its parts;
// - data-morph="title" | "picture" | "meta" | "description" | "tags": the parts.

// The card on this page whose title links to url, if there is one.
export function cardLinkingTo(url: URL | undefined): HTMLElement | null {
	if (!url) return null;
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		'[data-morph-card] [data-morph="title"] a'
	)) {
		if (new URL(link.href).pathname === url.pathname) return link.closest('[data-morph-card]');
	}
	return null;
}

// The header of the page on screen, if it has one that cards can turn into.
export const pageHeader = () => document.querySelector<HTMLElement>('[data-morph-page]');

export function mark(element: HTMLElement | null) {
	if (element) element.dataset.morphing = '';
}

export function unmarkAll() {
	for (const element of document.querySelectorAll<HTMLElement>('[data-morphing]')) {
		delete element.dataset.morphing;
	}
}

// The browser takes the "after" picture as soon as the update is done. The page's cover
// may still be loading then (a different, bigger file than the card's thumbnail), and
// the picture would be empty, so wait for it, but never long: the old page is frozen on
// screen meanwhile.
export async function picturesReady(element: HTMLElement | null, wait = 300) {
	const images = [...(element?.querySelectorAll('img') ?? [])].filter((img) => !img.complete);
	if (!images.length) return;
	const timeout = new Promise((resolve) => setTimeout(resolve, wait));
	await Promise.race([Promise.all(images.map((img) => img.decode().catch(() => {}))), timeout]);
}
