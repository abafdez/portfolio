---
title: 'Diseñar primero en oscuro: una paleta en oklch y tipografía monoespaciada'
description: Sustituí los grises de Open Props por mi propia escala de gris azulado en oklch, elegí un verde de terminal y diseñé primero el tema oscuro. Por qué oklch hace uniforme una escala, y qué significa "primero en oscuro" con light-dark().
cover: Elementos variados con estilo oscuro.
reviewed: false
---

Mi sitio usaba los grises y azules de Open Props. Están bien, pero se parecía a cualquier otro sitio. Para un aspecto técnico (terminal, planos, código) quería un gris azulado frío y un verde fósforo, como el de un monitor antiguo. Y como casi todos los desarrolladores que conozco navegan en modo oscuro, diseñé primero el tema oscuro.

## Por qué oklch

Construí los grises con `oklch()`:

```css
--ink-0: oklch(98% 0.004 250);
--ink-4: oklch(70% 0.022 250);
--ink-8: oklch(17% 0.018 250);
```

Los tres números son la **luminosidad**, el **croma** (cuánto color tiene) y el **tono** (un ángulo en el círculo cromático; 250 es azul).

El importante es la luminosidad. En oklch es luminosidad **percibida**: dos colores con la misma L le parecen a una persona más o menos igual de claros, sea cual sea su tono. HSL no funciona así: `hsl(60 100% 50%)` (amarillo) y `hsl(240 100% 50%)` (azul) tienen la misma "luminosidad" sobre el papel, y el amarillo parece mucho más brillante.

Eso me da dos cosas:

- **Una escala uniforme.** Valores de L igual de espaciados parecen igual de espaciados.
- **Un contraste previsible.** La distancia en L entre dos colores me dice más o menos cómo de legible es uno sobre el otro, antes incluso de pasar un comprobador.

Todos los pasos mantienen el tono 250, así que toda la escala es un único gris azulado coherente. Solo cambia la luminosidad, más un toque de croma en el centro para que los grises no parezcan muertos.

<!-- TODO: una captura de la escala ink, o una tira de muestras -->

## El color de acento

Verde de terminal, en dos versiones:

```css
--green-dark: oklch(46% 0.13 148);
--green-bright: oklch(84% 0.2 148);
```

El verde brillante sobre fondo oscuro es el aspecto que quería. Sobre un fondo claro, ese mismo verde no se puede leer, así que el modo claro recibe un verde oscuro con el mismo tono.

## Primero en oscuro con light-dark()

Mis tokens semánticos ya usaban [`light-dark()`](./2026-10-29-dark-mode):

```css
--brand: light-dark(var(--green-dark), var(--green-bright));
--text-1: light-dark(var(--ink-7), var(--ink-2));
--surface-1: light-dark(var(--ink-0), var(--ink-8));
```

"Primero en oscuro" no cambia la sintaxis. Cambia qué valor diseño. Ajusté el segundo valor de cada par (el oscuro) hasta que quedó bien, y luego elegí el primero (el claro) como su adaptación. El sitio sigue el sistema operativo por defecto.

Como los componentes solo usan tokens semánticos, todo el cambio ocurrió en `tokens.css`. No cambió ningún componente. ([Por qué importa esa capa](./2026-10-27-design-tokens).)

## Comprobar el contraste

Comprobé cada par de texto y superficie al definirlo, no cuando una página lo usó por primera vez (eso lo aprendí [por las malas](./2026-10-27-design-tokens)). Todos pasan el nivel AA de las WCAG (4,5:1). El más justo es el verde oscuro sobre la superficie elevada más clara, con 4,69:1.

<!-- TODO: la tabla de contraste: cada par y su ratio, en los dos temas -->

## Encabezados en monoespaciada

Los encabezados, el nombre del sitio, el menú y los botones usan Fira Code. El texto normal sigue en la fuente sans del sistema, porque los párrafos largos en monoespaciada cansan al leer. Dos tokens lo llevan:

```css
--font-heading: var(--font-code);
--font-label: var(--font-code);
```

La monoespaciada es ancha, así que los encabezados grandes llevan un poco de `letter-spacing` negativo.

## Pequeños detalles

El acento también aparece en sitios que solo notas al usar la página:

```css
::selection {
	background-color: var(--brand);
	color: var(--surface-1);
}

:focus-visible {
	outline: 2px solid var(--brand);
	outline-offset: 3px;
}

body {
	caret-color: var(--brand);
}
```

## Preparado para temas con nombre

Más adelante quiero temas con nombre (Tokyo Night, Dracula…). Cada uno será un bloque que sobrescriba los tokens semánticos:

```css
:root[data-theme='tokyo-night'] {
	--brand: …;
	--surface-1: …;
}
```

Por eso los componentes no deben usar nunca un valor base como `--green-bright`: un componente que lo hiciera ignoraría el `--brand` del tema y seguiría en verde dentro de Tokyo Night.

<!-- TODO: qué cambiaría todavía, por ejemplo una variable --ink-hue en vez de repetir 250 nueve veces -->

Lo siguiente: [el fondo de planos](./2026-10-31-blueprint-background).
