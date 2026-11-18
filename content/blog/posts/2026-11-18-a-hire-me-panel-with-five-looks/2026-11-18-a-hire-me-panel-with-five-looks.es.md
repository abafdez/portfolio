---
title: Un panel de "contrátame" con cinco estilos
description: 'Mi pie de página abre ahora un panel sobre mí y cómo contratarme, con una tarjeta arriba que cambia de estilo cada vez: una terminal, un foco, una tarjeta de visita, una tarjeta de "disponible" y un carné en 3D. Cómo funciona cada uno y cómo mantener cinco efectos tranquilos.'
reviewed: false
---

Mi pie de página tenía un botón verde flotante que te bajaba hasta él. Tapaba texto, y el pie al que te llevaba era una línea fina. Ahora el pie abre un panel: quién soy, cómo contratarme y dónde más encontrarme, con una tarjeta arriba que tiene cinco estilos, uno cada vez que se abre.

## Un asa que se da cuenta

En lugar del botón hay un asa discreta en el borde inferior, como la de una hoja en el móvil. Cuando el puntero se acerca a menos de 10rem del borde, crece, sube, se vuelve verde y muestra "Sobre mí y contratación". Es una sola propiedad personalizada, `--near`, de 0 a 1, escrita desde `pointermove` como mucho una vez por fotograma y directamente en el estilo del elemento: el estado de Svelte volvería a renderizar para nada con cada movimiento del ratón. Se desvanece cuando el pie entra en pantalla, con una animación ligada al desplazamiento, porque entonces el botón del propio pie ya se ve.

## Una hoja desde abajo

El panel es un popover, así que Escape y un clic fuera lo cierran, y el foco vuelve al botón que lo abrió. Sube desde abajo con `@starting-style` y `allow-discrete`, la misma técnica que la caja de búsqueda. Sus columnas tienen efectos propios en el borde: una luz que sigue al puntero y un haz que no para de dar vueltas a la columna "Contrátame", un degradado cónico cuyo ángulo es una propiedad personalizada registrada, para poder animarlo.

## Cinco estilos

![El estilo terminal: una ventana con tres luces, la foto y líneas escritas: whoami, cat hire.txt, contact --linkedin](./terminal.png 'La terminal se escribe sola mientras la foto se enfoca')

1. **Terminal**: `$ whoami`, `$ cat hire.txt` y `$ contact --linkedin` se escriben solos en unos dos segundos, mientras la foto se enfoca desde píxeles grandes. Los píxeles son un canvas: la foto dibujada a 6, 12, 24 y 48 píxeles de ancho, cada vez ampliada sin suavizado. Los lectores de pantalla reciben el texto terminado de golpe; la escritura queda oculta para ellos.
2. **Foco**: la foto dentro de un anillo que gira, una cuadrícula iluminada bajo el puntero y números que cuentan hacia arriba.
3. **Tarjeta de visita**: entra dándose la vuelta, y un botón la gira. La cara oculta es `inert`, así que no se puede enfocar ni leer hasta que se ve.
4. **Disponible**: una insignia que late, una foto que hace glitch en rojo y cian al pasar el ratón (un filtro SVG que ya usan los temas de color) y un botón que se inclina hacia el puntero y suelta chispas.
5. **Carné en 3D**: se inclina hacia el puntero, y sus partes están a distintas profundidades, así que se separan al girar.

![El carné en 3D inclinado hacia el puntero, con un brillo metalizado verde](./id-card.png 'El carné se inclina, y la foto queda por delante de la tarjeta')

Al principio todos los estilos se inclinaban. Una tarjeta en 3D es una sorpresa; cinco son un parque de atracciones, así que la inclinación pasó a ser un estilo propio. Además hacía que el panel se desplazara en horizontal: una caja transformada sigue contando como desbordamiento para su contenedor. `overflow: hidden auto` en el panel solo deja desplazar arriba y abajo. Y `preserve-3d` se aplana con cualquier antepasado que recorte, así que el propio carné no puede usar `overflow: hidden`.

## Tranquilo por defecto

Cada estilo se carga solo cuando se muestra. Con movimiento reducido ninguno se mueve: sin escritura, contadores, anillo, giro, inclinación, haz ni chispas. Siguen siendo cinco maneras de enseñar las mismas tres cosas: mi cara, a qué me dedico y cómo contactarme.

![El estilo foco sobre las tres columnas: quién soy, contrátame y los enlaces con iconos](./spotlight.png 'El estilo foco, con las tres columnas debajo')
