---
title: Entrar en el CMS a través de un Worker
reviewed: false
---

## Qué hicimos

- El CMS ya se publica con el sitio: `pnpm build` también construye `/portfolio/admin/`. Para entrar ahí con GitHub hace falta un pequeño servidor, el autenticador de Sveltia ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)), que funciona como un Worker de Cloudflare. Estos son los pasos; cuando escribí esto aún no los había hecho.
- **1. Desplegar el Worker.** Crear una cuenta de Cloudflare (basta con el plan gratuito) y pulsar "Deploy to Cloudflare Workers" en el README del proyecto, o clonarlo y ejecutar `wrangler deploy`. El Worker recibe una URL como `https://sveltia-cms-auth.<subdominio>.workers.dev`.
- **2. Registrar una GitHub App.** El README tiene un enlace que rellena casi todo el formulario. Cambio dos campos: el nombre (único en GitHub, 34 caracteres como máximo) y la **Redirect URI**, `<URL del Worker>/callback`. El resto se queda como viene: los tokens de usuario caducan, sin webhook, Contents y Pull requests de _lectura y escritura_ (las pull requests, para el flujo editorial), Metadata de solo lectura, instalable solo en mi cuenta. Tras **Create GitHub App** copio el **Client ID** y luego, en **Credentials → New secret**, el secreto del cliente.
- **3. Instalar la app** con **Install App → Only select repositories → portfolio**. Solo puede tocar ese repositorio.
- **4. Darle sus ajustes al Worker.** En Cloudflare, **Settings → Runtime variables and secrets**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (marcado como secreto, para que el panel lo oculte) y `ALLOWED_DOMAINS=abafdez.github.io`.
- **5. Apuntar el CMS hacia él.** Descomentar `base_url` bajo `backend` en `src/lib/cms/config.yml` con la URL del Worker, hacer push, y en el siguiente despliegue "Sign In with GitHub" funciona.

## Qué aprendí

- **Por qué hace falta un servidor:** cambiar el código de un solo uso de GitHub por un token necesita el secreto del cliente, y un secreto no puede vivir en un sitio estático: cualquiera podría leerlo en el JavaScript. GitHub Pages no ejecuta código, así que el secreto vive en el Worker, y el Worker es lo único que lo ve.
- **El script es un solo archivo, `src/index.js`,** que exporta `fetch(request, env)`: Cloudflare lo llama en cada petición, y `env` guarda las variables del paso 4. Mira la ruta y el método:
  - `GET /auth` (el CMS lo abre en una ventana emergente): comprueba que el backend es `github` y que el sitio que pregunta (`site_id`, el nombre de host) encaja con `ALLOWED_DOMAINS` (un `*` se convierte en comodín de regex; el resto se escapa). Después genera un token aleatorio, lo guarda en una cookie `HttpOnly`, `Secure` y `SameSite=Lax` durante 10 minutos y en el parámetro `state`, y redirige a la página de acceso de GitHub con el client ID.
  - `GET /callback` (GitHub me devuelve aquí con un `code` y el mismo `state`): si `state` no coincide con la cookie, se detiene, porque ese acceso lo empezó otro (CSRF). Si coincide, envía el código con el client ID y el secreto a GitHub y recibe un token de acceso y un token de renovación.
  - Responde con una página HTML diminuta que pasa el token a la ventana del CMS con `postMessage`. Primero la ventana emergente dice `authorizing:github` a quien la abrió; el CMS contesta; la ventana comprueba el **origen de esa respuesta** contra `ALLOWED_DOMAINS` y solo entonces envía `authorization:github:success:{…}` a ese origen. El origen de un mensaje lo pone el navegador y quien lo envía no puede falsearlo, así que otro sitio que abra la ventana nunca recibe el token. La página lleva `Cache-Control: no-store` y borra la cookie.
  - `POST /auth` renueva: el token de usuario de una GitHub App caduca a las 8 horas, y renovarlo también necesita el secreto, así que el CMS envía el token de renovación (válido 6 meses) al Worker, que añade el secreto y se lo pide a GitHub. Las cabeceras CORS solo van a orígenes permitidos.
- **GitHub App, no OAuth app:** el token de una OAuth app llega a todos los repositorios en los que puedo hacer push, también a los privados. El de una GitHub App se limita a los repositorios donde está instalada y a los permisos que pidió. Los scopes no le afectan (el script aún los tiene para instalaciones antiguas con OAuth).
- **`ALLOWED_DOMAINS` es el cerrojo.** Sin él, cualquiera podría usar mi Worker, y otro sitio podría conseguir un token a través de él.
- **Algo que tener presente:** el CMS guarda el token en el almacenamiento del navegador de `abafdez.github.io`, que comparten todos los sitios de GitHub Pages de mi cuenta. Un script en otro de mis sitios de Pages podría leerlo, así que en esos sitios solo pongo código en el que confío.

## Enlaces

- [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth): los pasos del README y `src/index.js`
- [Sveltia CMS: backend de GitHub](https://sveltiacms.app/en/docs/backends/github)
- [Generar un token de acceso de usuario para una GitHub App](https://docs.github.com/es/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)
- [Renovar tokens de acceso de usuario](https://docs.github.com/es/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- [Cloudflare Workers: el manejador fetch](https://developers.cloudflare.com/workers/runtime-apis/fetch/)
- [MDN: Window.postMessage()](https://developer.mozilla.org/es/docs/Web/API/Window/postMessage)

## Siguiente

- Crear el Worker y la GitHub App, descomentar `base_url` y entrar en el sitio publicado. Después guardar un cambio y comprobar que abre una pull request (el flujo editorial).
