// The guide half of the cursors tool: what each feature does, when to use it, what to
// avoid. Our own words (MDN's prose is CC BY-SA, so it's linked, not copied).
// `Backticks` become <code> (Prose.svelte).
import type { Translated } from '#lib/i18n/index.ts';

export interface Section {
	id: string;
	// The short label on its tab.
	tab: Translated;
	title: Translated;
	intro: Translated[];
	use: Translated[];
	avoid: Translated[];
	mdn: { name: string; url: `https://developer.mozilla.org/${string}` };
}

const cursor: Section = {
	id: 'cursor',
	tab: { en: 'Cursors', es: 'Cursores' },
	title: { en: 'The cursor says what a click will do', es: 'El cursor dice qué hará un clic' },
	intro: [
		{
			en: 'Before anyone clicks, the cursor already tells them what will happen: an I-beam over text they can select, a hand over a link. The browser picks it by itself (`auto`), so most of the time you don’t set it at all.',
			es: 'Antes de que nadie haga clic, el cursor ya dice qué va a pasar: una barra en I sobre texto que se puede seleccionar, una mano sobre un enlace. El navegador lo elige solo (`auto`), así que casi nunca hace falta tocarlo.'
		},
		{
			en: 'Set it when an element does something the browser can’t guess from the HTML: a card you can drag, a panel edge that resizes, an image that zooms. Browsers give the hand only to links; buttons keep the arrow. Many sites, this one included, give buttons `pointer` too, so everything you can click looks clickable.',
			es: 'Cámbialo cuando un elemento hace algo que el navegador no puede adivinar por el HTML: una tarjeta que se arrastra, el borde de un panel que cambia de tamaño, una imagen que se amplía. Los navegadores solo dan la mano a los enlaces; los botones se quedan con la flecha. Muchos sitios, este incluido, también dan `pointer` a los botones, para que todo lo que se puede pulsar lo parezca.'
		}
	],
	use: [
		{
			en: '`grab` and `grabbing` for things you drag: a card, a slider, a map.',
			es: '`grab` y `grabbing` para lo que se arrastra: una tarjeta, un control deslizante, un mapa.'
		},
		{
			en: '`col-resize` or `ew-resize` on a handle between two panels.',
			es: '`col-resize` o `ew-resize` en el tirador entre dos paneles.'
		},
		{
			en: '`zoom-in` on an image that opens bigger.',
			es: '`zoom-in` en una imagen que se abre más grande.'
		},
		{
			en: '`progress` while something loads but the page still works; `wait` only when it really doesn’t.',
			es: '`progress` mientras algo carga pero la página sigue funcionando; `wait` solo cuando de verdad no funciona.'
		}
	],
	avoid: [
		{
			en: '`pointer` on things that aren’t links or buttons: it promises a click that does nothing.',
			es: '`pointer` en lo que no es un enlace ni un botón: promete un clic que no hace nada.'
		},
		{
			en: '`none`, unless you draw a cursor of your own (a game, a drawing tool).',
			es: '`none`, salvo que dibujes un cursor propio (un juego, una herramienta de dibujo).'
		},
		{
			en: 'Putting meaning only in the cursor: phones and tablets have none, and keyboard users never see it.',
			es: 'Poner información solo en el cursor: los móviles y las tabletas no tienen, y quien usa el teclado nunca lo ve.'
		}
	],
	mdn: { name: 'cursor', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor' }
};

const custom: Section = {
	id: 'custom-cursor',
	tab: { en: 'Your own', es: 'El tuyo' },
	title: { en: 'Your own cursor, in SVG', es: 'Tu propio cursor, en SVG' },
	intro: [
		{
			en: 'Any image can be a cursor: `cursor: url(…) x y, auto`. The two numbers are the hotspot, the pixel that clicks, counted from the top-left corner (`0 0` if you leave them out). The keyword at the end is required: it’s the cursor used when the image can’t be.',
			es: 'Cualquier imagen puede ser un cursor: `cursor: url(…) x y, auto`. Los dos números son el punto activo, el píxel que hace clic, contado desde la esquina de arriba a la izquierda (`0 0` si no los pones). La palabra clave del final es obligatoria: es el cursor que se usa cuando la imagen no se puede usar.'
		},
		{
			en: 'SVG fits well: a few hundred bytes of text that stay sharp and can go right in the CSS as a data URL, with no extra request. It needs a `width` and `height` of its own, and its colours written as values: a CSS variable can’t reach inside it.',
			es: 'SVG encaja bien: unos cientos de bytes de texto que se ven nítidos y van directamente en el CSS como data URL, sin otra petición. Necesita un `width` y un `height` propios, y sus colores escritos como valores: una variable de CSS no llega dentro.'
		}
	],
	use: [
		{
			en: 'A playful spot: a game, a drawing canvas, a hero section with character.',
			es: 'Un rincón con gracia: un juego, un lienzo de dibujo, una portada con personalidad.'
		},
		{
			en: 'A tool where precision matters, like a colour picker.',
			es: 'Una herramienta donde importa la precisión, como un selector de color.'
		}
	],
	avoid: [
		{
			en: 'Anything bigger than 32 × 32: Chromium and Firefox ignore cursors over 128 × 128, and big ones hide what’s under them.',
			es: 'Nada más grande de 32 × 32: Chromium y Firefox ignoran los cursores de más de 128 × 128, y los grandes tapan lo que hay debajo.'
		},
		{
			en: 'Replacing the cursor on the whole page: some people set a bigger or higher-contrast one in their system settings, and yours replaces it.',
			es: 'Cambiar el cursor en toda la página: hay quien configura uno más grande o con más contraste en su sistema, y el tuyo lo sustituye.'
		},
		{
			en: 'Links and text, where people expect the usual hand and I-beam.',
			es: 'Enlaces y texto, donde se espera la mano y la barra en I de siempre.'
		}
	],
	mdn: { name: 'cursor: url()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor' }
};

const animated: Section = {
	id: 'animated',
	tab: { en: 'Animated', es: 'Animados' },
	title: { en: 'Cursors that move', es: 'Cursores que se mueven' },
	intro: [
		{
			en: 'A GIF makes a poor cursor: browsers draw only its first frame. To animate the real cursor, swap its image a few times a second from JavaScript, one small image per frame. That’s the trick behind alienmelon’s animatedWebCursors; the frames here are our own SVGs, drawn in code, and each carries its own hotspot.',
			es: 'Un GIF es un mal cursor: los navegadores solo dibujan su primer fotograma. Para animar el cursor de verdad, cambia su imagen varias veces por segundo desde JavaScript, una imagen pequeña por fotograma. Es el truco de animatedWebCursors, de alienmelon; los fotogramas de aquí son SVG propios, dibujados en código, y cada uno lleva su propio punto activo.'
		},
		{
			en: 'Two more ways to the same thing. CSS can do it alone: `cursor` can be animated with `@keyframes`, one keyframe per frame (checked in Chromium). And a GIF can still be the source: split into frames in the browser with `ImageDecoder`, it moves like the rest (Safari can’t split it yet).',
			es: 'Dos formas más de hacer lo mismo. CSS puede hacerlo solo: `cursor` se puede animar con `@keyframes`, un fotograma clave por fotograma (comprobado en Chromium). Y un GIF puede seguir siendo el origen: dividido en fotogramas en el navegador con `ImageDecoder`, se mueve como los demás (Safari aún no puede dividirlo).'
		},
		{
			en: 'The other way is to leave the cursor alone and draw something that follows it: a trail, sparkles, a ghost. It’s a layer on top with `pointer-events: none`, so clicks still reach the page.',
			es: 'La otra forma es dejar el cursor tranquilo y dibujar algo que lo siga: una estela, chispas, un fantasma. Es una capa encima con `pointer-events: none`, así que los clics siguen llegando a la página.'
		}
	],
	use: [
		{
			en: 'A playful corner: a game, a portfolio’s hero, an easter egg.',
			es: 'Un rincón divertido: un juego, la portada de un portfolio, un huevo de pascua.'
		},
		{
			en: 'A busy state you draw yourself, like a spinner while something saves.',
			es: 'Un estado de espera dibujado por ti, como una rueda mientras algo se guarda.'
		}
	],
	avoid: [
		{
			en: 'Motion for people who asked for less: with `prefers-reduced-motion`, keep it still (these do).',
			es: 'Movimiento para quien pidió menos: con `prefers-reduced-motion`, déjalo quieto (estos lo hacen).'
		},
		{
			en: 'Animating the cursor everywhere: it distracts, and a timer swapping images costs battery.',
			es: 'Animar el cursor en todas partes: distrae, y un temporizador cambiando imágenes gasta batería.'
		},
		{
			en: 'Effects that cover what’s under the pointer, where people are trying to aim.',
			es: 'Efectos que tapan lo que hay bajo el puntero, justo donde se intenta apuntar.'
		}
	],
	mdn: {
		name: 'prefers-reduced-motion',
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion'
	}
};

const pointerEvents: Section = {
	id: 'pointer-events',
	tab: { en: 'pointer-events', es: 'pointer-events' },
	title: {
		en: 'Clicks that pass through: pointer-events',
		es: 'Clics que atraviesan: pointer-events'
	},
	intro: [
		{
			en: 'With `pointer-events: none`, an element stops existing for the mouse, the finger and the pen: clicks, hover and the cursor go to whatever is underneath, as if it weren’t there.',
			es: 'Con `pointer-events: none`, un elemento deja de existir para el ratón, el dedo y el lápiz: los clics, el paso del puntero y el cursor van a lo que haya debajo, como si no estuviera.'
		},
		{
			en: 'It doesn’t stop the keyboard. A button with `pointer-events: none` can still be reached with Tab and pressed with Enter, so it isn’t a way to disable anything.',
			es: 'No detiene el teclado. Un botón con `pointer-events: none` se puede seguir alcanzando con Tab y pulsando con Intro, así que no sirve para desactivar nada.'
		}
	],
	use: [
		{
			en: 'Decoration laid over content: a fade at the end of a list, or a grid over the page (this site’s background grid uses it).',
			es: 'Decoración encima del contenido: un degradado al final de una lista, o una cuadrícula sobre la página (la cuadrícula de fondo de este sitio lo usa).'
		},
		{
			en: 'An icon inside a button, so `event.target` is the button, not the icon.',
			es: 'Un icono dentro de un botón, para que `event.target` sea el botón y no el icono.'
		},
		{
			en: 'A tooltip or a badge that shouldn’t steal the hover from what’s under it.',
			es: 'Un tooltip o una insignia que no deben robar el paso del puntero a lo que tienen debajo.'
		}
	],
	avoid: [
		{
			en: 'Disabling a control: use the `disabled` attribute, or `inert` for a whole area, which stop the keyboard too.',
			es: 'Desactivar un control: usa el atributo `disabled`, o `inert` para una zona entera, que también detienen el teclado.'
		},
		{
			en: 'Something that looks clickable: people will try, and nothing will happen.',
			es: 'Algo que parece pulsable: la gente lo intentará y no pasará nada.'
		}
	],
	mdn: {
		name: 'pointer-events',
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events'
	}
};

const userSelect: Section = {
	id: 'user-select',
	tab: { en: 'user-select', es: 'user-select' },
	title: { en: 'What can be selected: user-select', es: 'Qué se puede seleccionar: user-select' },
	intro: [
		{
			en: 'People select text all the time: to copy it, to translate it, to look a word up, or just to keep their place while reading. `user-select` decides what a press and drag picks up.',
			es: 'La gente selecciona texto todo el rato: para copiarlo, traducirlo, buscar una palabra o simplemente no perder el sitio mientras lee. `user-select` decide qué recoge pulsar y arrastrar.'
		},
		{
			en: '`none` makes an element unselectable, `text` makes it selectable again inside one that isn’t, and `all` selects the whole element at once: one click and it’s ready to copy. Safari still needs the prefixed `-webkit-user-select` (only its preview version has the plain one), so write both.',
			es: '`none` hace que un elemento no se pueda seleccionar, `text` lo vuelve seleccionable dentro de uno que no lo es, y `all` selecciona el elemento entero de una vez: un clic y listo para copiar. Safari aún necesita la versión con prefijo, `-webkit-user-select` (solo su versión preliminar tiene la normal), así que escribe las dos.'
		}
	],
	use: [
		{
			en: '`all` on something people copy whole: a command, an ID, a short code.',
			es: '`all` en lo que se copia entero: un comando, un identificador, un código corto.'
		},
		{
			en: '`none` on controls you drag or double-click a lot, where a stray selection gets in the way: a drag handle, a slider, a game board.',
			es: '`none` en controles que se arrastran o se pulsan dos veces a menudo, donde una selección sin querer molesta: un tirador, un control deslizante, un tablero de juego.'
		}
	],
	avoid: [
		{
			en: '`none` on content: text people can’t select is text they can’t copy, translate or quote.',
			es: '`none` en el contenido: un texto que no se puede seleccionar no se puede copiar, traducir ni citar.'
		},
		{
			en: 'Thinking it protects anything: the text is still in the page, one “view source” away.',
			es: 'Pensar que protege algo: el texto sigue en la página, a un “ver código fuente” de distancia.'
		}
	],
	mdn: { name: 'user-select', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/user-select' }
};

const selection: Section = {
	id: 'selection',
	tab: { en: '::selection', es: '::selection' },
	title: {
		en: 'The colour of a selection: ::selection',
		es: 'El color de una selección: ::selection'
	},
	intro: [
		{
			en: 'Selected text gets the system’s colours unless you set `::selection`. Only a few properties work there: `color`, `background-color`, `text-decoration`, `text-shadow` and the `-webkit-text-stroke` ones. A background image is ignored.',
			es: 'El texto seleccionado toma los colores del sistema salvo que definas `::selection`. Ahí solo funcionan unas pocas propiedades: `color`, `background-color`, `text-decoration`, `text-shadow` y las de `-webkit-text-stroke`. Una imagen de fondo se ignora.'
		},
		{
			en: 'This site selects in its brand colour, with the page’s background colour for the text. Safari on iPhone and iPad ignores `::selection` and keeps the system’s.',
			es: 'Este sitio selecciona con su color de marca, y el color de fondo de la página para el texto. Safari en iPhone y iPad ignora `::selection` y se queda con el del sistema.'
		}
	],
	use: [
		{
			en: 'Matching selections to your brand, as long as the text stays readable.',
			es: 'Que las selecciones vayan con tu marca, siempre que el texto se siga leyendo.'
		}
	],
	avoid: [
		{
			en: 'Low contrast: selected text still has to be read, at 4.5:1 like any other text.',
			es: 'Poco contraste: el texto seleccionado se tiene que poder leer, a 4,5:1 como cualquier otro.'
		},
		{
			en: 'Changing it just for looks: people know what a selection looks like on their own system.',
			es: 'Cambiarlo solo por estética: la gente sabe cómo es una selección en su propio sistema.'
		}
	],
	mdn: {
		name: '::selection',
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/::selection'
	}
};

export const guide = { cursor, custom, animated, pointerEvents, userSelect, selection };
export const sections: Section[] = [cursor, custom, animated, pointerEvents, userSelect, selection];

// Text for the demos.
export const samples = {
	none: { en: 'You can’t select this sentence.', es: 'Esta frase no se puede seleccionar.' },
	auto: { en: 'This one you can, as usual.', es: 'Esta sí, como siempre.' },
	textOuter: { en: 'Not this part, ', es: 'Esta parte no, ' },
	textInner: { en: 'but this part, yes.', es: 'pero esta sí.' },
	themeHeading: { en: 'A heading', es: 'Un título' },
	themeText: {
		en: 'Some text: hover over it, then over the button.',
		es: 'Algo de texto: pasa el puntero por encima, y luego por el botón.'
	},
	themeButton: { en: 'A button', es: 'Un botón' },
	selection: {
		en: 'Select this paragraph, or press the button, to see your colours on real text. Selected text is still text: it has to be read.',
		es: 'Selecciona este párrafo, o pulsa el botón, para ver tus colores sobre texto de verdad. El texto seleccionado sigue siendo texto: hay que poder leerlo.'
	}
} satisfies Record<string, Translated>;
