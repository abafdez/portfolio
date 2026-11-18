---
title: Un tema claro que parece papel
description: Mi tema claro era el oscuro con las luces encendidas. El primer arreglo quedó demasiado chillón; comparar tres direcciones con capturas dio con la buena, verde tinta sobre blanco cálido, y un test se asegura de que la cuadrícula nunca deje el texto por debajo de 4,5:1.
reviewed: false
---

Diseñé este sitio empezando por el modo oscuro, y el tema claro quedó en segundo plano: los mismos neutros gris azulados y fríos, aclarados. Funcionaba, pero era apagado. Así se arregló, en dos rondas, porque la primera tampoco funcionó.

## Primera ronda: demasiado chillón

Hace semanas probé tres direcciones y las dejé en espera. Elegí una, el **cuaderno de ingeniería**: papel crema, texto color lápiz y la cuadrícula de plano en el verde de marca, como el papel cuadriculado de ingeniería. Por separado quedaba bien. En las páginas reales estaba recargado: líneas menores verdes, líneas mayores verdes y cruces verdes por todas partes, y el verde fósforo brillante, perfecto en una terminal oscura, quedaba estridente sobre el crema.

## Comparar con capturas

El color es difícil de juzgar con una descripción, así que la segunda ronda comparó capturas reales. Cada dirección son solo unos pocos tokens semánticos (página, paneles, bordes, texto, texto atenuado, marca, cuadrícula), así que se puede probar en la página real inyectándolos:

```js
const style = document.createElement('style');
style.textContent = `:root[data-theme='light'] { --surface-1: #f9f8f5; --brand: #095b41; … }`;
document.head.append(style);
```

Tres direcciones, cada una capturada en la portada y en un artículo con código y avisos: **verde tinta** (la misma identidad, más tranquila), **plano** (tinta azul de Prusia sobre papel frío, un plano técnico de verdad) y **grafito** (blanco, un acento esmeralda y solo las cruces de la cuadrícula). Cada valor se comprobó en contraste antes de renderizar nada. Ganó el verde tinta.

![Un artículo con el tema claro verde tinta: hoja blanca cálida, texto grafito oscuro, un aviso en verde oscuro y código sobre paneles casi blancos, con una cuadrícula tenue a los lados](./light-post.png 'Verde tinta: blanco cálido, texto grafito y una cuadrícula discreta en los márgenes')

## El verde tinta como tokens

Solo cambió la mitad clara de unos pocos tokens. Las primitivas describen los materiales:

```css
--paper-0: oklch(99.6% 0.002 95); /* paneles interiores, código */
--paper-1: oklch(98% 0.005 95); /* la página y sus hojas */
--paper-3: oklch(91% 0.01 95); /* bordes */
--pencil-1: oklch(23% 0.012 160); /* texto */
--pencil-2: oklch(45% 0.015 160); /* texto atenuado */
--green-dark: oklch(42% 0.085 165); /* la marca, como tinta de pluma */
```

`--surface-1/2/3`, `--text-1/2` y `--brand` apuntan a ellas en claro y mantienen sus valores oscuros. El papel es un blanco con una calidez mínima, no crema; el texto es grafito con un toque del tono de la marca, para que los neutros y el verde vayan juntos. El verde es más oscuro y mucho menos saturado que el fósforo del tema oscuro: la misma familia, otro material. No cambió ningún componente, porque los componentes solo usan tokens semánticos.

## Una cuadrícula más tranquila

En claro la cuadrícula perdió las líneas menores y volvió al color del texto en lugar del de marca: líneas mayores tenues al 6 % y cruces al 16 %. Ahora se lee como una textura en los bordes de la página, no como un patrón que compite con ella.

## Decoración que cuenta como fondo

En este sitio el texto de tamaño normal nunca va sobre la cuadrícula (va sobre una hoja), pero el menú de la cabecera sí, y el puntero ilumina la cuadrícula a su alrededor. Así que el test de los temas compone la pila real en el punto más brillante del foco: la página, la línea mayor de la cuadrícula, un brillo de marca del 3 % y una línea de marca del 10 %. Medido en el navegador, el texto atenuado del menú mantiene ahí 5,09:1 y la marca 5,6:1; sobre las superficies normales, los colores del código y de los avisos superan todos 6:1.

Una trampa de CSS de la primera ronda: `light-dark()` solo acepta colores, así que `color-mix(in oklab, var(--brand) light-dark(6%, 8%), transparent)` no es válido. Hay que escribir la mezcla entera dos veces, una por modo.
