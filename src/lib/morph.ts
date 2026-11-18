// Cards that turn into the page they open: the title, the picture, the date line, the
// description and the tags fly from the card to their places in the page's header (and
// back again when you return to the list). Run from the root layout's onNavigate.
//
// How: a view transition morphs two elements into each other when they have the same
// view-transition-name, one before the change and one after. Names must be unique on a
// page, so they aren't on every card all the time: only the card (or header) marked
// data-morphing has them, during a "morph" transition (the CSS is in global.css).
//
// The markup (TeaserCard, a search result, ArticleHeader, ProjectHeader, an Awesome
// list's header):
// - data-morph-card: a card, around its parts (or a link that is the whole card, like a
//   search result);
// - data-morph-page: a page's header, around its parts;
// - data-morph="title" | "picture" | "meta" | "description" | "tags": the parts.

// The card on this page whose title links to url, if there is one.
export function cardLinkingTo(url: URL | undefined): HTMLElement | null {
	if (!url) return null;
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		'[data-morph-card] [data-morph="title"] a, a[data-morph-card]'
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

// A card that is still on the new page (a search result: the search box stays in the
// page while the page behind it changes) can't keep its names, or two elements would
// share one and the browser would skip the transition. So it's unmarked, and the box it
// sits in closes at once, without its own closing animation (data-instant), so the
// "after" picture doesn't show it.
export function leave(card: HTMLElement | null) {
	if (!card?.isConnected) return;
	delete card.dataset.morphing;
	const box = card.closest<HTMLElement>('[popover]');
	if (!box) return;
	// Even if it's already closing (the search box closes itself after a navigation, with
	// its animation): taking the transition away cancels a running one too.
	box.dataset.instant = '';
	if (box.matches(':popover-open')) box.hidePopover();
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
