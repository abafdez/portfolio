---
title: 'El texto plano nunca es plano: UTF-8 en un artículo'
description: Caracteres, puntos de código y bytes son tres cosas distintas. Cómo UTF-8 convierte unos en otros, por qué "ñ" a veces aparece como "Ã±", y qué significa para HTML, CSS y JavaScript.
reviewed: false
---

Mi caja de herramientas ya tiene una tabla de símbolos HTML, y cada símbolo muestra sus **bytes UTF-8**: © es `C2 A9`, € es `E2 82 AC`, 😀 es `F0 9F 98 80`. ¿Por qué un carácter ocupa dos bytes, otro tres y otro cuatro? Eso es UTF-8, la codificación del 99,1 % de la web ([W3Techs](https://w3techs.com/technologies/overview/character_encoding), noviembre de 2026), y merece la pena entenderla una vez.

Si prefieres verlo a leerlo, Dylan Beattie cuenta toda la historia, de los primeros telégrafos británicos a la ortografía danesa y las matrículas ucranianas, en esta charla (en inglés):

```yt
src: https://www.youtube.com/watch?v=gd5uJ7Nlvvo
title: Plain Text, de Dylan Beattie (NDC Copenhagen 2022)
thumbnail: ./plain-text-talk.jpg
```

## Tres cosas, no una

- Un **carácter** es la idea: "el signo de copyright".
- Un **punto de código** es su número en Unicode: U+00A9 (169 en decimal). Unicode tiene sitio para 1 114 112, de U+0000 a U+10FFFF.
- Los **bytes** son cómo se guarda o se envía ese número. Una **codificación** es la regla que convierte puntos de código en bytes y al revés.

Unicode solo reparte los números. UTF-8, UTF-16 y UTF-32 son tres codificaciones de los mismos números.

## Antes de Unicode: un byte, muchos significados

ASCII (1963) usaba 7 bits: 128 caracteres, suficientes para el inglés. El octavo bit dejaba 128 sitios más, y cada región los llenó a su manera. En Latin-1, el byte `F1` es "ñ"; en una página de códigos cirílica, el mismo byte es otra letra. Un archivo no decía qué tabla usaba, así que quien lo leía adivinaba.

De esa adivinanza sale el texto destrozado, y todavía pasa. "ñ" en UTF-8 son dos bytes, `C3 B1`. Léelos como Latin-1, un byte por carácter, y obtienes `C3` = "Ã" y `B1` = "±": **"Ã±"**. Los bytes están bien; la adivinanza falló. Tiene nombre, _mojibake_, "transformación de caracteres" en japonés.

## Cómo funciona UTF-8

UTF-8 (Ken Thompson y Rob Pike, 1992) usa de 1 a 4 bytes por punto de código, y los primeros bits de cada byte dicen qué es:

| Puntos de código   | Bytes | Patrón                                |
| ------------------ | ----- | ------------------------------------- |
| U+0000 – U+007F    | 1     | `0xxxxxxx`                            |
| U+0080 – U+07FF    | 2     | `110xxxxx 10xxxxxx`                   |
| U+0800 – U+FFFF    | 3     | `1110xxxx 10xxxxxx 10xxxxxx`          |
| U+10000 – U+10FFFF | 4     | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` |

Las `x` son los bits del punto de código, rellenados desde la derecha. Para © (U+00A9):

```text
A9 en binario:         1010 1001
11 bits para 2 bytes:  00010 101001
en el patrón:          110 00010   10 101001
en hexadecimal:        C2          A9
```

El diseño tiene propiedades preciosas:

- **ASCII es UTF-8.** Los 128 primeros puntos de código ocupan un byte, el mismo que en ASCII, así que todo archivo ASCII ya es un archivo UTF-8 válido.
- **Siempre sabes dónde estás.** Un byte que empieza por `10` es una continuación; cualquier otro empieza un carácter. Salta al medio de un archivo y encontrarás el siguiente carácter en tres bytes como mucho.
- **Sin ASCII falso.** Todos los bytes de un carácter de varios bytes tienen el bit más alto a 1, así que una `/`, un `<` o unas comillas nunca aparecen dentro de uno. El código que los busca sigue funcionando.

## La web: dilo, y pronto

El navegador necesita saber la codificación antes de leer el texto, así que la página la dice, en sus primeros 1024 bytes:

```html
<meta charset="utf-8" />
```

El `app.html` de SvelteKit empieza con ella. Una cabecera `Content-Type: text/html; charset=utf-8` del servidor dice lo mismo, y gana si no coinciden.

Con UTF-8 declarado, puedes escribir © directamente en el HTML. Las entidades como `&copy;` siguen siendo útiles para lo que cuesta escribir o ver: `&nbsp;`, `&ndash;`, y los caracteres que usa el propio HTML, `&lt;` y `&amp;`.

## JavaScript cuenta otra cosa

Por dentro, las cadenas de JavaScript no son UTF-8: son **UTF-16**, unidades de 16 bits. Los puntos de código hasta U+FFFF ocupan una unidad; los de encima, dos, un _par subrogado_. Así que `length` cuenta unidades, no caracteres:

```js
'©'.length; // 1
'😀'.length; // 2: D83D DE00
[...'😀'].length; // 1: al expandir una cadena se recorren puntos de código
'\u{1F600}' === '😀'; // true: \u necesita llaves por encima de FFFF
```

Por eso la herramienta de símbolos muestra también las unidades UTF-16, y por eso escribe `\u{1F600}` para un emoji pero `©` para ©. Y `TextEncoder` es la forma de pasar de una cadena de JavaScript a bytes UTF-8, justo lo que [necesita Base64](/blog/2026-11-09-base64-encodes-bytes-not-text).

## Enlaces

- [Joel Spolsky: The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/) (2003, sigue vigente)
- [RFC 3629: UTF-8](https://www.rfc-editor.org/rfc/rfc3629)
- [MDN: `<meta charset>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/meta#charset)
- [W3C: Declarar la codificación de caracteres en HTML](https://www.w3.org/International/questions/qa-html-encoding-declarations.es)
- [MDN: caracteres UTF-16, puntos de código Unicode y grupos de grafemas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters)
