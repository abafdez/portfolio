---
title: Un tema claro que parece papel
description: Mi tema claro era el oscuro con las luces encendidas, frío y apagado. Ahora es papel crema con texto de lápiz y una cuadrícula del color de marca, y un test se asegura de que la cuadrícula nunca deje el texto por debajo de 4,5:1.
reviewed: false
---

Diseñé este sitio empezando por el modo oscuro, y el tema claro quedó en segundo plano: los mismos neutros gris azulados y fríos, aclarados. Funcionaba, pero era apagado. Hace semanas probé tres direcciones y las dejé en espera; esta semana elegí una, el **cuaderno de ingeniería**: papel crema cálido, texto color lápiz y una cuadrícula verde, como el papel cuadriculado de ingeniería.

![Un artículo con el tema claro nuevo: página y hoja color crema, texto oscuro y cálido, bloques de código y un aviso sobre paneles casi blancos, y una cuadrícula verde tenue a los lados](./light-post.png 'Papel crema, texto de lápiz y una cuadrícula verde en los márgenes')

## Papel y lápiz como tokens

Solo cambió la mitad clara de unos pocos tokens semánticos. Unas primitivas nuevas describen los materiales:

```css
--paper-0: oklch(99.5% 0.006 95); /* paneles interiores, código */
--paper-1: oklch(97% 0.02 95); /* la página y sus hojas */
--paper-3: oklch(91% 0.028 100); /* bordes */
--pencil-1: oklch(24% 0.02 60); /* texto */
--pencil-2: oklch(45% 0.03 60); /* texto atenuado */
```

y `--surface-1/2/3` y `--text-1/2` apuntan a ellas en claro, sin tocar sus valores oscuros. El tono 95 es un crema amarillento y el 60 un gris parduzco: junto al verde parecen papel y grafito, mientras que los gris azulados parecen una pantalla. No cambió ningún componente, porque los componentes solo usan tokens semánticos.

## Una cuadrícula del color de cada tema

La cuadrícula de plano detrás de la página era el color del texto a un pequeño porcentaje, en los dos modos. En claro ahora es el color de **marca**, y eso es lo que la hace parecer un cuaderno de ingeniería. Como es `var(--brand)` y no un verde fijo, la mitad clara de cada tema de color tiene una cuadrícula de su propio color: violeta en Catppuccin, azul en Tokyo Night.

## Decoración que cuenta como fondo

En este sitio el texto de tamaño normal nunca va sobre la cuadrícula (va sobre una hoja), pero el menú de la cabecera sí, y el puntero ilumina la cuadrícula a su alrededor. Medido en el punto más brillante del foco, una línea de cuadrícula de marca al 9 % bajo la línea del foco al 15 % dejaba el texto gris del menú en 4,42:1, por debajo del 4,5:1 que necesita.

En lugar de reajustar cinco temas que estaban al límite, suavicé el foco en claro: un brillo del 3 % y líneas al 10 % sobre una línea de cuadrícula al 6 % suman algo menos de color de marca que el 4 % + 15 % del oscuro, así que todo lo que aprobaba sigue aprobando. El test de los temas compone ahora esa pila para la mitad clara de cada tema, así que un tema que no pase no puede entrar.

Una trampa de CSS por el camino: `light-dark()` solo acepta colores, así que `color-mix(in oklab, var(--brand) light-dark(6%, 8%), transparent)` no es válido. Hay que escribir la mezcla entera dos veces, una por modo.
