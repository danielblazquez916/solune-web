# Consentimiento y páginas legales

Implementado el 25-09-2026. Rutas bilingües `/legal`, `/privacidad` y `/cookies`, con acceso directo y desde el footer.

## Estado actual

- Dominio: https://solune.dev. Email: hola@solune.dev.
- Titular, NIF y domicilio: pendientes visibles, sin datos inventados. Registro mercantil, si procede, y proveedor del buzón receptor también deben completarse antes de publicar.
- Actualización 26-09-2026: Contacto usa Turnstile, Worker y Resend cuando se configuran las variables públicas; sin ellas, queda deshabilitado. Véase `CLOUDFLARE-CONTACT.md`. No se guarda el formulario en localStorage.
- GA4 está desactivado: ID vacío y `VITE_GA4_PRIVACY_READY=false`. No se carga Google ni se muestran cookies analíticas como si estuvieran instaladas.
- Turnstile protege exclusivamente el formulario. No se han añadido publicidad, remarketing ni almacenamiento de parámetros UTM.

## Inventario

| Clave | Tipo | Activación | Duración |
| --- | --- | --- | --- |
| `luma.consent` | localStorage | Decisión expresa, incluida negativa | 180 días desde la decisión |
| `luma.locale` | localStorage | Solo al aceptar Preferencias | Hasta retirar Preferencias o detectar caducidad del consentimiento |
| `_ga`, `_ga_<ID>` | Cookies propias de GA4 | Solo con configuración real y consentimiento analítico | Configuradas a 180 días sin renovación automática |

localStorage no caduca por sí mismo: la aplicación comprueba y elimina registros caducados al arrancar y durante la visita. Si el navegador bloquea almacenamiento, mantiene la decisión en memoria. Cerrar el panel, navegar o hacer scroll no concede permiso. El panel usa diálogo nativo, foco contenido y pausa de Lenis.

## Activar Analytics más adelante

1. Introducir el ID real en `VITE_GA4_ID`, nunca un ID de ejemplo.
2. En la propiedad y flujo de GA4, desactivar medición mejorada (incluidos formularios e historial), Google Signals, personalización publicitaria y vínculos publicitarios. Configurar y documentar la retención de datos de la propiedad.
3. Confirmar estos ajustes mediante `VITE_GA4_PRIVACY_READY=true` y recompilar.
4. Verificar con el flujo real: ninguna petición previa al consentimiento; una vista por cambio de ruta; ausencia de datos de formulario, query strings y fragmentos; nombres y duración real de cookies; retirada y recarga. La integración real está pendiente del ID.

El controlador utiliza consentimiento básico: no descarga el script antes de aceptar. Envía vistas manuales de rutas conocidas, sin consultas ni fragmentos. Al retirar permiso deshabilita la medición, elimina cookies `_ga` accesibles y recarga si el script había empezado a cargar, descartando sus listeners y temporizadores. No puede borrar cookies HttpOnly o de otros dominios.

## Verificación

`npm test`: consentimiento válido/caducado/corrupto, almacenamiento bloqueado, rechazo, bloqueo del script, vistas sin duplicados, URL saneada, retirada durante descarga, eliminación selectiva de cookies, traducciones y formulario. Las pruebas de GA4 usan un entorno simulado y no transmiten datos a Google.

Verificación en navegador: rechazo persistente tras recarga, configuración desde footer, Analytics deshabilitado, Preferencias e idioma recordados, rutas legales directas y revisión móvil a 375 px sin overflow horizontal de página. Las tablas tienen su propio desplazamiento horizontal accesible.

## Referencias

- [Guía de cookies de la AEPD](https://www.aepd.es/guias/guia-cookies.pdf)
- [LSSI](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)
- [Consent Mode de Google](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Configuración de GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)

Los textos reflejan la implementación actual; completar los datos pendientes y revisar los cambios de proveedores o tratamientos antes de publicar.
