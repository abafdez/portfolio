// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}       // Data passed from hooks (e.g., event.locals.user)
		// Common data shared across route load functions.
		interface PageData {
			// How the root layout arranges this route: <main data-composition>, styled in
			// global.css. A route sets it in its +layout.ts or +page.ts; unset is 'default'.
			composition?: 'default' | 'reading';
		}
		// interface PageState {}    // Shallow routing state
		// interface Platform {}     // Platform-specific objects (e.g., Cloudflare Workers env/bindings)
	}
}

export {};
