# LUMA

Estudio digital bilingüe construido con React, TypeScript, Vite, React Router y Framer Motion. Diseño original, dos proyectos conceptuales con guías de marca y prototipos interactivos, cinco servicios, estudio, contacto y privacidad.

## Ejecutar

Requiere Node.js 22.12 o posterior.

```sh
npm ci
npm run dev
```

Aplicación: http://127.0.0.1:5173. Para comprobar producción:

```sh
npm run build
npm run preview
npm test
```

La preview utiliza http://127.0.0.1:4173. La compilación genera `dist/`. El hosting de producción utiliza Cloudflare Workers Static Assets con fallback SPA, configurado en `wrangler.jsonc`. Consulta la guía de producción para preparar las variables antes del build.

## Contenido y traducciones

- `src/i18n/locales/es.json` y `en.json`: textos, accesibilidad, validación y metadata. Las claves están tipadas y las pruebas verifican paridad y parámetros.
- `src/i18n/index.ts`: almacén de idioma, selector instantáneo y persistencia en `localStorage` (`luma.locale`) únicamente con consentimiento de Preferencias. `?lang=es` y `?lang=en` permiten enlaces a un idioma. Las rutas mantienen los mismos slugs en ambos idiomas.
- Para añadir un idioma, crear el catálogo con las mismas claves, registrarlo en `locales` y `catalogs`, añadir las etiquetas del selector y ampliar las alternativas SEO en `SEO.tsx`.
- `src/data/projects.ts` y `services.ts`: datos y contenido de proyectos y servicios. Añadir un proyecto con un slug nuevo permite usar la misma arquitectura de detalle.
- `src/styles`: sistema visual global, proyectos y mejoras de navegación/movimiento.

El cambio de idioma conserva el estado de formularios y prototipos. Los valores de las opciones son identificadores estables; las etiquetas se traducen al renderizar.

## Contacto y publicación

El formulario utiliza Cloudflare Turnstile → Worker → Resend, con destino `hola@solune.dev`. Configurar `VITE_TURNSTILE_SITE_KEY` y `VITE_CONTACT_API_URL`; sin ambas, el envío queda deshabilitado, sin simulación de éxito. Los secrets de Turnstile y Resend solo se configuran en el Worker. Frontend y API se despliegan por separado. Consulta [la guía de configuración y pruebas](docs/CLOUDFLARE-CONTACT.md) para desarrollo local, dominio, correo y despliegue. El resto de la identidad visual de este checkout sigue siendo Luma.

Antes de publicar, revisar los perfiles sociales de muestra y completar la información legal del titular. Los proyectos NOVA y ÉTER son conceptos ficticios identificados como tales, no encargos de clientes. Sus reservas son demostraciones locales.

## Imágenes y movimiento

Scroll con Lenis (`SmoothScroll.tsx`): interpolación ligera `lerp: 0.16` sin amplificar la rueda. En punteros táctiles y con movimiento reducido se mantiene el scroll nativo; los cambios de preferencia se aplican en vivo. Los anchors conservan su URL y el espacio del header sticky. Las rutas reinician la posición y cancelan la inercia, el menú pausa Lenis y los campos con scroll propio quedan excluidos. Configuración basada en la [documentación oficial de Lenis](https://github.com/darkroomengineering/lenis).

La pantalla inicial está incluida en `index.html`, con estilos críticos inline para aparecer antes de React. `InitialLoad` se monta cuando la ruta inicial está lista; espera fuentes e imágenes del primer viewport, con salida de seguridad de 4 segundos para recursos atascados. El mínimo es de 180 ms desde el inicio de navegación y el fade dura 320 ms. No se repite al navegar internamente y respeta movimiento reducido. Durante la carga, el contenido está marcado como `inert` para evitar enfocar controles ocultos.

Fotografías locales con variantes WebP de 640, 1200 y 2400 px; fuentes y procedencia en `public/images/README.txt`. Los originales se conservan. `node scripts/optimize-assets.mjs` regenera las variantes. No se cargan imágenes de la web de referencia.

El navbar conserva su altura al desplazarse. Las imágenes usan revelados y zoom leve sin desenfoque. El glow ambiental tiene `pointer-events: none`, interpola posiciones sin renders React y detiene su RAF cuando llega al destino. Se desactiva en dispositivos táctiles y con movimiento reducido. Los reveals, transiciones, parallax y marquee respetan `prefers-reduced-motion`.

## Verificación

Consultar `docs/QA.md` para el alcance de las comprobaciones y `reports/` para los informes Lighthouse. `docs/DESIGN.md` documenta la referencia, dirección artística y arquitectura.

## Cookies e información legal

Rutas `/legal`, `/privacidad` y `/cookies`, traducidas a ES/EN. Banner y configurador accesible desde el footer, con decisión válida durante 180 días. GA4 permanece desactivado sin ID y sin confirmar su configuración privada. Consultar `docs/PRIVACY.md` para inventario, configuración y datos pendientes.
