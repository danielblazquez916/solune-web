# Producción: Solune en Cloudflare

## Arquitectura

- `wrangler.jsonc`: Worker **solune-web**, solo Static Assets de `dist/`, para `solune.dev` y `www.solune.dev`. Fallback `single-page-application` para React Router.
- `worker/wrangler.jsonc`: Worker **solune-contact**, `POST /contact`, dominio `api.solune.dev`.
- Flujo: formulario → Turnstile → Worker → Siteverify → Resend → `hola@solune.dev`.
- Remitente: `Solune · Web <formularios@solune.dev>`. `Reply-To`: email del visitante. No se registra el mensaje, las credenciales ni las respuestas privadas del proveedor.
- No se necesita binding de correo de Cloudflare. La API usa HTTPS a Resend, sin SDK adicional.

## Instalar

Node.js 22.12+ (las pruebas TypeScript requieren una versión con `--experimental-strip-types`; validado con Node 24).

```sh
npm ci
npm --prefix worker ci
```

Se versionan ambos lockfiles. No se suben dependencias ni builds.

## Variables públicas del frontend

Copia `.env.example` a `.env.production.local` y completa:

| Variable | Producción |
| --- | --- |
| VITE_CONTACT_API_URL | https://api.solune.dev/contact |
| VITE_TURNSTILE_SITE_KEY | Site Key pública del widget real de Solune |
| VITE_SITE_URL | https://solune.dev |
| VITE_LEGAL_WEBSITE | https://solune.dev |
| VITE_LEGAL_EMAIL | hola@solune.dev |

El archivo local de producción de este equipo ya contiene la Site Key pública facilitada por el propietario. No está versionado. En otro equipo/CI hay que volver a configurar estas variables **antes del build**. Variables del dashboard en runtime no modifican un bundle ya compilado.

Los campos legales pendientes se mantienen vacíos y se muestran como pendientes. No inventar titular, NIF ni domicilio. GA4 permanece desactivado si no se configuran su ID y la confirmación de privacidad.

El build falla con un endpoint diferente al de producción, una Site Key de prueba/ausente o nombres de credenciales privadas bajo `VITE_`. Ninguna credencial de Resend o Turnstile debe usar ese prefijo. Las variables del proceso/CI prevalecen sobre los archivos `.env`.

## Desarrollo

Usa `.env.development.local` para el frontend: endpoint `http://127.0.0.1:8787/contact` y Site Key oficial de prueba. Obtén el par de claves públicas de prueba en [Turnstile testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

Copia `worker/.dev.vars.example` a `worker/.dev.vars.development` solo si este último no existe. Introduce allí la Secret Key oficial de prueba de Turnstile y tu API key local de Resend. Ambos nombres están en el ejemplo, sin valores. **No sobrescribas tu archivo local existente.**

En terminales separadas:

```sh
npm run dev
npm --prefix worker run dev
```

Vite utiliza 5173 y puede usar 5174 si está ocupado; preview utiliza 4173. Development permite solamente los localhost/127.0.0.1 de esos puertos. No usa los dominios públicos. El Worker de producción tiene un allowlist independiente que además se verifica en el código: nunca acepta localhost, aunque se añada por error a su configuración.

La excepción de `action`/`hostname` de las claves oficiales exige simultáneamente entorno `development`, origen local y la Secret Key dummy oficial de éxito. Producción exige `success === true`, `action === "contact"`, hostname idéntico al del origen permitido y timestamp válido de hasta 5 minutos (tolerancia de reloj futura: 30 segundos). Rechaza claves dummy.

El Worker local llama a Resend real: un envío manual sí puede entregar correo. Las pruebas automáticas simulan ambos servicios y no envían correo.

## Comprobaciones sin publicar

```sh
npm run check
npm --prefix worker run check
npm run test:all
npm run build
npm run check:secrets
npm run dry-run:web
npm --prefix worker run dry-run
npm run preview:cloudflare
```

La última orden sirve el build en `http://127.0.0.1:8788`; sirve para revisar rutas/assets. El formulario de este build apunta a producción y CORS rechaza ese origen local: para probar envíos locales usa Vite y el Worker development.

No hay script de lint en este proyecto. TypeScript, pruebas, formato de los archivos modificados y compilación son las comprobaciones disponibles.

## Cuenta, dominios y correo

1. Cloudflare: comprueba que la zona `solune.dev` está activa en la cuenta que usarás con Wrangler.
2. Cloudflare → **Turnstile** → widget de Solune → **Settings / Hostname Management**: permite `solune.dev` y `www.solune.dev`. Usa su Site Key en el build y su Secret Key exclusivamente en la API. No añadas localhost al widget de producción.
3. Resend → **Domains** → `solune.dev`: confirma estado verificado y permiso para enviar desde `formularios@solune.dev`. Si falta algún registro, añade en Cloudflare → **DNS → Records** exactamente los nombres, tipos y valores que muestre Resend. No hay registros DNS inventados en este proyecto. Conserva los MX de recepción existentes.
4. Resend → **API Keys**: utiliza una clave con permiso de envío limitada a ese dominio cuando esté disponible. Guárdala como `RESEND_API_KEY` en el Worker, nunca en el frontend.
5. Confirma que el buzón o reenvío existente `hola@solune.dev` recibe correo. El servicio de envío no crea ese buzón.

## Desplegar manualmente

Desde la raíz, después de configurar las variables públicas y revisar las comprobaciones:

```sh
npx wrangler login
cd worker
npx wrangler secret put TURNSTILE_SECRET_KEY --env production
npx wrangler secret put RESEND_API_KEY --env production
npx wrangler deploy --env production
cd ..
npm run deploy:web
```

Los comandos `secret put` piden los valores de forma interactiva. No los pongas en argumentos de terminal, GitHub, documentación ni mensajes.

Las rutas Custom Domain ya están declaradas. Wrangler puede crear la asociación y los registros administrados por Cloudflare al desplegar. Si hay un conflicto con un dominio ya asociado, revisa su destino antes de reemplazarlo. No hace falta inventar un registro A o CNAME.

Para gestionarlos desde el dashboard: **Workers & Pages → solune-contact → Settings → Domains & Routes → Add → Custom Domain → api.solune.dev**. Para **solune-web**, repetir con `solune.dev` y `www.solune.dev`. Verifica el certificado activo. No asocies `api.solune.dev` al Worker estático.

No se ha desplegado ni modificado ningún recurso de la cuenta durante esta preparación.

## GitHub y auditoría

`.gitignore` excluye entornos reales, credenciales, dependencias, builds, estado de Wrangler, Graphify, informes, temporales y ajustes locales del editor. Los archivos de ejemplo tienen solo nombres vacíos; `wrangler.jsonc`, paquetes y lockfiles sí se versionan.

`npm run check:secrets` recorre los archivos candidatos según Git y los assets compilados. Busca formatos conocidos de credenciales, asignaciones sensibles, referencias privadas en el bundle y copias de los secrets de archivos locales. No imprime sus valores. Genera `reports/git-candidate-files.txt` (ignorado). Este análisis no reemplaza la revisión humana y no inspecciona el historial de otros repositorios.

Antes del primer commit/push, revisa:

```sh
git status --short --untracked-files=all
npm run check:secrets
```

Después de preparar el staging tú mismo, revisa `git diff --cached --stat` y `git diff --cached`. No se han creado commits, remotes ni pushes automáticamente.

## Prueba final real

1. Tras desplegar ambos Workers, abre `https://solune.dev/contacto` y recarga directamente. Repite con una ruta de proyecto y en móvil.
2. Completa el formulario con datos de prueba propios, acepta privacidad y espera la verificación Turnstile. Pulsa enviar una sola vez.
3. En Network comprueba `POST https://api.solune.dev/contact` con HTTP 200 y `{ "ok": true, "code": "sent" }`; la UI muestra éxito y limpia los campos.
4. Revisa **Resend → Emails**: destinatario, remitente y estado de entrega. Confirma en la bandeja de entrada/spam de `hola@solune.dev` que ha llegado y que **Responder** apunta al email de prueba.
5. Un HTTP 200 confirma aceptación por Resend, no recepción en el buzón. Si no llega, revisa los eventos de Resend y el buzón receptor. No compartas tokens ni el contenido del formulario en capturas públicas.

La recepción real, las credenciales de producción y el DNS quedan pendientes de esta comprobación externa. Los tests locales cubren aceptación, validación, errores de proveedor, doble clic, expiración, CORS y replay con servicios simulados.

Referencias: [Workers SPA](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/), [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Resend API](https://resend.com/docs/api-reference/emails/send-email), [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
