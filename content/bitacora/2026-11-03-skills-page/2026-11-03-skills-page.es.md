---
title: Una página sobre mí con mis habilidades en vez de un CV
reviewed: false
---

## Qué hicimos

- La fase 5 cambió: no hay CV público. Tiene mi teléfono, mi correo y mis empresas, así que lo envío si me lo piden. `/cv` pasó a ser `/about`: con qué trabajo, por grupos (lenguajes, web, bases de datos, mainframe, herramientas, formas de trabajar, flujos con IA, sistemas, multimedia e idiomas), con botones para pedir el CV por LinkedIn o GitHub.
- Las habilidades son datos en `src/lib/skills/skills.ts`, separados de la página, como `projects.ts`. Cada habilidad tiene un nombre, un icono, un nivel (de 1 Aprendiendo a 4 Podría enseñarlo), una nota y pruebas: enlaces a una entrada del Devlog, una herramienta, una lista Awesome o una URL donde se ve.
- Dos librerías de iconos: Lucide (`@lucide/svelte`) para los iconos genéricos y Simple Icons para los logos de marca. Simple Icons da cada logo como datos (un trazado y un color de marca), así que `BrandIcon.svelte` lo dibuja.
- Cada logo conserva el tono de su marca pero toma la luminosidad del tema (`--icon-tone`), con la sintaxis de color relativo de OKLCH.
- Una habilidad con más que contar es un `<details>`: su fila es el `<summary>`, y se abre para mostrar la nota y las pruebas.

## Qué aprendí

- `Evidence` es una unión de `{ entry }`, `{ tool }`, `{ list }` y `{ url }`, y `'entry' in evidence` la estrecha, así que `evidenceHref()` solo puede construir un enlace que pase la comprobación de tipos de `resolve()`.
- `'path' in Icon` distingue un Simple Icon (datos) de un icono de Lucide (un componente), así que un solo campo `icon` acepta los dos.
- Los iconos de Lucide se importan de uno en uno (`@lucide/svelte/icons/globe`). El índice del paquete carga los 2.000 en desarrollo.
- LinkedIn, VS Code, Adobe e IBM no están en Simple Icons: las marcas pidieron que se quitaran. LinkedIn lleva un icono genérico de mensaje.
- `oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h))` toma la luminosidad del color del tema y pone el croma y el tono de la marca. Un logo negro (GitHub) se sigue viendo en el tema oscuro, y todos los iconos tienen el contraste del texto.
- El tono y el croma salen del hex con las matemáticas de OKLab (`brand-color.ts`): luz lineal, luego las respuestas de los conos del ojo y luego a y b. El tono es el ángulo, y el croma la distancia al gris. El croma tiene un tope de 0,17, o las marcas muy saturadas se salen de la gama de la pantalla y se recortan de forma desigual.
- Un lector de pantalla oye el nivel como una palabra. La barra es `aria-hidden`, y una coma oculta a la vista hace que se lea "CSS, A diario".

## Problemas y soluciones

- A 320px, un nombre largo ("Virtualization") junto a "Comfortable" hacía la página 17px demasiado ancha. `minmax(0, 1fr)` deja que la columna del nombre se encoja, y `hyphens: auto` parte la palabra.
- La introducción fija medía 805px de alto, más que la pantalla. Ahora solo se queda fijo el menú de secciones.

## Enlaces

- [Lucide para Svelte](https://lucide.dev/guide/packages/lucide-svelte)
- [Simple Icons](https://simpleicons.org/) y su [aviso legal](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
- [MDN: colores relativos](https://developer.mozilla.org/es/docs/Web/CSS/CSS_colors/Relative_colors)
- [Björn Ottosson: OKLab](https://bottosson.github.io/posts/oklab/)
- [TypeScript: estrechar con `in`](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing)

## Siguiente

- Revisar mis niveles y el texto de la introducción, y añadir lo que falta.
