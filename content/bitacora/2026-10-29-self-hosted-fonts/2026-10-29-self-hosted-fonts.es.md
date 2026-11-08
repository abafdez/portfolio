---
title: Fuentes alojadas en mi sitio, una por sección
reviewed: false
---

## Qué hicimos

- Elegí las fuentes: Fira Code para el código, Shantell Sans para la Bitácora y la pila de fuentes del sistema (`--font-sans` de Open Props) para todo lo demás.
- Instalé `@fontsource-variable/fira-code` y `@fontsource-variable/shantell-sans` como dependencias de desarrollo y las importé en el layout raíz.
- Añadí tokens de fuente a `tokens.css` (`--font-body`, `--font-code`, `--font-hand`) y los usé en `global.css`.
- Añadí `src/routes/bitacora/+layout.svelte`, que envuelve la sección y fija `--font-body: var(--font-hand)`.
- Lo probé en el sitio construido con `BASE_PATH=/portfolio`.

## Qué aprendí

- Las fuentes funcionan como los colores: valores base, luego tokens semánticos y luego sobrescrituras por sección. Los temas futuros y los estilos de usuario serán más sobrescrituras de tokens.
- Los navegadores solo descargan una fuente cuando algún texto de la página la usa. La portada no descarga ningún archivo de fuente. La Bitácora solo descarga Shantell Sans, y Fira Code solo llega cuando hay un elemento `<code>`.
- Fontsource incluye subconjuntos por `unicode-range`, así que una página solo en alfabeto latino solo descarga el archivo latino.
- Alojarlas yo significa que no hay ninguna petición a terceros en tiempo de ejecución. El argumento de la caché de la CDN también ha caído: los navegadores ahora tienen una caché separada por sitio.
- Vite reescribe cada `url()` del CSS que procesa como una ruta relativa, así que las fuentes funcionan bajo la ruta base de GitHub Pages en cualquier caso. Lo probé: `url("/robots.txt")` pasó a ser `url(../../../robots.txt)`. Las fuentes en `static/fonts/` también habrían funcionado. Solo se romperían bajo `/portfolio` las URLs que Vite nunca ve, como rutas escritas a mano en `app.html` o en atributos `style` en línea.
- Por qué Fontsource de todas formas: nombres de archivo con hash (seguros para guardarlos en caché para siempre), subconjuntos por `unicode-range` ya hechos y actualizaciones con `pnpm update`.
- Un `var()` dentro de una custom property se resuelve donde se define la propiedad. `--font-heading: var(--font-body)` en `:root` se resuelve en `:root`, así que la sobrescritura de `--font-body` de una sección nunca le llega. Hay que usar un valor de respaldo donde se usa el valor: `font-family: var(--font-heading, var(--font-body))`.
- La misma regla explica por qué el envoltorio de la Bitácora vuelve a poner `font-family`. `body` ya calculó su fuente, y los hijos heredan ese valor calculado, no el token.
- JIT también inyecta las variables anidadas de Open Props: `--font-sans` apunta a `--font-system-ui`, y las dos acabaron en el build.

## Decisiones

- Shantell Sans solo con el eje de grosor: 79 KB para el alfabeto latino. La versión con el eje Informal pesa 146 KB. Puedo cambiar más adelante.
- La fuente del sistema por defecto: cero descargas, a cambio de verse distinta en cada sistema operativo.

## Problemas y soluciones

- Mi primera versión encadenaba `--font-heading: var(--font-body)` en `:root`. Los encabezados de la Bitácora se habrían quedado con la fuente del sistema. Lo arreglé con el patrón del valor de respaldo de arriba.
- Dimos por hecho que `url('/fonts/…')` en `static/` daría un 404 bajo `/portfolio`. Un build de prueba mostró que Vite la reescribe como una ruta relativa. Hay que probar las suposiciones sobre las herramientas de build en vez de fiarse de ellas.

## Enlaces

- [Fontsource](https://fontsource.org/)
- [Shantell Sans](https://shantellsans.com/)
- [Fira Code](https://github.com/tonsky/FiraCode)
- [MDN: unicode-range](https://developer.mozilla.org/es/docs/Web/CSS/@font-face/unicode-range)

## Siguiente

- La revisión de accesibilidad con Lighthouse y el contraste en los dos temas, y luego la PR de la fase 3.
