---
title: Un pie de página que se abre
reviewed: false
---

## Qué hicimos

- Cambié la flecha flotante de "baja al pie", que tapaba texto, por un asa discreta en el borde inferior. Crece, sube, se vuelve verde y muestra "Sobre mí y contratación" cuando el puntero se acerca a menos de 10rem del borde (`--near`, de 0 a 1, desde `pointermove`, una vez por fotograma). Desaparece cuando entra el pie (una línea de tiempo de vista).
- El asa y el botón del propio pie (una píldora verde con un brillo que la cruza) abren un popover que sube desde abajo: una tarjeta arriba y luego tres columnas (quién soy, contrátame, en otros sitios).
- La tarjeta de arriba tiene cinco estilos, uno distinto cada vez que se abre: una terminal que se escribe sola mientras la foto se enfoca desde píxeles, una tarjeta con un anillo que gira y contadores, una tarjeta de visita que se da la vuelta, una tarjeta de "disponible" con la foto que hace glitch y un botón magnético, y un carné en 3D que se inclina hacia el puntero.
- Cada columna tiene un efecto en el borde: una luz que sigue al puntero (quién soy, en otros sitios) o un haz que da vueltas (contrátame). Los enlaces de "en otros sitios" tienen iconos que saltan.
- Hay un botón de correo listo pero oculto hasta que se ponga una dirección en `links.ts`.

## Qué aprendí

- Una tarjeta inclinada puede hacer que su contenedor se desplace en horizontal: las cajas transformadas cuentan como desbordamiento. `overflow: hidden auto` en el panel solo deja desplazar arriba y abajo.
- `preserve-3d` se aplana si algún antepasado entre la tarjeta y sus partes recorta (`overflow: hidden`), así que la tarjeta en 3D no puede recortar.
- La dirección noreply de GitHub no recibe correo, así que no sirve de contacto; un alias que reenvíe, sí.
- Con movimiento reducido todos los estilos se quedan quietos: sin escritura, contadores, inclinación, haz ni chispas.
- La primera inclinación escuchaba en la tarjeta y la medía ya inclinada: saltaba al pasar el ratón, y en el borde la tarjeta inclinada se salía de debajo del puntero, volvía a su sitio, regresaba, una y otra vez. Ahora escucha en toda la página, empieza a inclinarse a 140 px, mide la caja sin inclinar (`offsetLeft`/`offsetWidth` ignoran las transformaciones) y suaviza los ángulos en cada fotograma desde el script en lugar de con una transición CSS.

## Siguiente

- Elegir la dirección de contacto.
