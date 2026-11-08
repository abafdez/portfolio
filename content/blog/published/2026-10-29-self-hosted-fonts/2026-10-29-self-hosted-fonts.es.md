---
title: Una fuente distinta para cada parte de mi sitio, todas alojadas en él
description: Fira Code para el código, una fuente manuscrita para mi bitácora y la fuente del sistema en todo lo demás. Sin Google Fonts y sin coste extra en las páginas que no las usan.
cover: Una caja con fuentes de texto.
reviewed: false
---

Quería que cada parte de mi portfolio tuviera su propio carácter. El código tenía que parecer código, mi diario de desarrollo (la Bitácora) tenía que parecer un cuaderno, y el resto no tenía que llamar la atención. Además, no quería ninguna petición a terceros.

## Las elegidas

- **Código: [Fira Code](https://github.com/tonsky/FiraCode).** Es Fira Mono con ligaduras opcionales, así que `=>` se dibuja como una flecha. Se pueden desactivar con `font-variant-ligatures: none`.
- **Bitácora: [Shantell Sans](https://shantellsans.com/).** Parece escrita a mano, pero está diseñada para seguir siendo legible en textos largos. Las fuentes caligráficas de verdad quedan genial en un título y cansan después de un párrafo.
- **Todo lo demás: la fuente del sistema.** La pila `--font-sans` de Open Props usa la propia fuente del sistema operativo. Es gratis e instantánea, a cambio de verse algo distinta en Windows, macOS y Android.

## Por qué alojarlas yo

- **Privacidad.** Cargar fuentes desde los servidores de Google le envía a Google la dirección IP de cada visitante. Un tribunal alemán dictaminó en 2022 que eso incumple el RGPD.
- **El argumento de la caché de la CDN ya no vale.** Antes se decía "todo el mundo tiene ya en caché la copia de Roboto de Google". Ahora los navegadores tienen una caché separada por sitio, así que esa copia nunca se reutiliza en el tuyo.
- **Un servidor menos al que conectarse**, así que a menudo la fuente llega antes.

Los costes: te encargas tú de las actualizaciones (raras en las fuentes), tienes que mantener los archivos pequeños y tienes que revisar la licencia. Las tres fuentes tienen la SIL Open Font License, que permite alojarlas tú.

## Fontsource

[Fontsource](https://fontsource.org/) empaqueta fuentes de código abierto como paquetes de npm:

```sh
pnpm add -D @fontsource-variable/fira-code @fontsource-variable/shantell-sans
```

```ts
// src/routes/+layout.svelte
import '@fontsource-variable/fira-code';
import '@fontsource-variable/shantell-sans';
```

Cada import es un archivo CSS lleno de reglas `@font-face`. Vite copia los archivos `.woff2` en `build/` con nombres con hash y reescribe las URLs. npm solo interviene al instalar. Los visitantes solo hablan con mi sitio.

¿Por qué no descargar los `.woff2` en `static/fonts/` y ya está? También funciona. Mi sitio vive bajo `/portfolio` en GitHub Pages, y esperaba que `url('/fonts/x.woff2')` diera un 404 ahí. Lo probé: Vite reescribe cada `url()` del CSS que procesa como una ruta relativa (`url("/robots.txt")` pasó a ser `url(../../../robots.txt)`). Solo se romperían las URLs que Vite nunca ve, como una ruta escrita a mano en `app.html` o en un atributo `style` en línea.

Lo que aporta Fontsource es comodidad: los subconjuntos por `unicode-range` ya están hechos, los archivos tienen nombres con hash para que los navegadores puedan guardarlos en caché para siempre y `pnpm update` se encarga de las actualizaciones.

## Las fuentes solo cuestan donde se usan

Me preocupaba que tres fuentes significaran tres descargas en cada página. No es así. **Un navegador solo descarga una fuente cuando algún texto de la página la usa de verdad.** Lo comprobé en el sitio construido:

| Página                        | Archivos de fuentes descargados            |
| ----------------------------- | ------------------------------------------ |
| Portada                       | ninguno                                    |
| Bitácora                      | Shantell Sans (solo latino)                |
| Cualquier página con `<code>` | Fira Code (solo latino), cuando hace falta |

Lo de "solo latino" viene de `unicode-range`. Fontsource divide cada fuente en subconjuntos (latino, latino extendido, cirílico, griego…), y el navegador solo descarga los que necesita para los caracteres de la página.

## Tokens de fuente por sección

Las fuentes siguen el mismo patrón que mis [tokens de color](./2026-10-27-design-tokens): valores base, luego tokens semánticos, luego sobrescrituras.

```css
/* tokens.css */
:root {
	--font-body: var(--font-sans);
	--font-code: 'Fira Code Variable', var(--font-mono);
	--font-hand: 'Shantell Sans Variable', var(--font-sans);
}
```

```css
/* global.css, @layer base */
body {
	font-family: var(--font-body);
}
h1,
h2,
h3 {
	font-family: var(--font-heading, var(--font-body));
}
code,
kbd,
pre,
samp {
	font-family: var(--font-code);
}
```

La Bitácora tiene su propio layout, que solo sobrescribe un token:

```svelte
<!-- src/routes/bitacora/+layout.svelte -->
<div class="bitacora">{@render children()}</div>

<style>
	.bitacora {
		--font-body: var(--font-hand);
		font-family: var(--font-body);
	}
</style>
```

Todo lo que hay dentro de la sección toma la fuente manuscrita, y ningún componente sabe nada de ella. Así es también como pienso hacer más temas y estilos de usuario más adelante: cada uno no es más que un conjunto de tokens sobrescritos.

## La trampa: var() se resuelve donde se define

Mi primera versión tenía esto en `tokens.css`:

```css
:root {
	--font-body: var(--font-sans);
	--font-heading: var(--font-body); /* ❌ */
}
```

Parece que `--font-heading` sigue a `--font-body`. No es así. Un `var()` dentro de una custom property **se resuelve en el elemento donde se define la propiedad**, aquí `:root`. Los hijos heredan el resultado, una pila de fuentes normal, no una referencia viva. Así que cuando la Bitácora sobrescribía `--font-body`, `--font-heading` seguía siendo la fuente del sistema, y mis encabezados se quedaban con la fuente equivocada.

La solución es resolver el valor donde se usa, con un valor de respaldo:

```css
h1 {
	font-family: var(--font-heading, var(--font-body));
}
```

Ahora `--font-body` se busca en el propio `h1`, dentro de la sección, y recoge la sobrescritura. La misma regla explica por qué el envoltorio de la Bitácora vuelve a poner `font-family`: `body` ya calculó su fuente, y los hijos heredan ese valor calculado, no el token.

**Actualización:** más adelante, para la [identidad que empieza por el modo oscuro](./2026-10-31-dark-first-palette), los encabezados pasaron a usar Fira Code en todas partes. Así que `--font-heading` se define ahora en `:root` como `var(--font-code)`, y un nuevo `--font-label` hace lo mismo para el menú, los botones y los textos pequeños de la interfaz. Ninguno de los dos sigue ya a `--font-body`, a propósito, así que esta trampa no puede pillarlos. La regla sigue valiendo para cualquier token construido a partir de otro.
