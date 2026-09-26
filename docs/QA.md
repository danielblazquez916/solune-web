# Verificación — 24 de septiembre de 2026

## Aplicación

- `npm run build`: TypeScript y Vite completan sin errores ni warnings.
- `npm test`: 7 pruebas aprobadas (validación, catálogos completos, parámetros interpolados y traducción de errores).
- `npx prettier --check src tests README.md`: correcto.
- Producción servida con Vite preview y recorrida mediante navegador: home, nosotros, proyectos, ambos casos, servicios, cinco servicios individuales, contacto, privacidad y 404. Sin errores ni warnings de consola en esta sesión de producción.
- Comprobados enlaces internos, siguiente proyecto en ambos sentidos, menú, Escape, foco y formulario; recarga directa del caso dental en producción.

## Idiomas y responsive

- 28 cargas directas: 14 rutas × ES/EN, con un único h1, títulos traducidos, imágenes sin errores y sin overflow horizontal.
- 72 combinaciones: home, nosotros, ambos casos, desarrollo y contacto × 6 anchos (1440, 1280, 1024, 768, 430 y 375 px) × ES/EN. Sin overflow horizontal.
- Revisión visual del hero, proyectos, menú y caso ÉTER en móvil; hero y navbar en escritorio.
- Selector instantáneo; persiste al navegar y recargar. Nombre, servicio y presupuesto del formulario conservados al cambiar de idioma; errores traducidos sin borrar datos.
- Selector del tratamiento y día del prototipo dental conservados al cambiar de idioma; confirmación de demo traducida.
- Navbar sticky comprobado después de scroll: posición superior estable, clase de opacidad aplicada y sin cambio de altura.

## Rendimiento y accesibilidad

Informes de laboratorio locales Lighthouse, sobre build de producción, con Chrome headless. Los resultados varían según máquina, red y ejecución; no representan mediciones de tráfico real ni certifican por sí solos accesibilidad completa.

| Escenario                                          | Performance | Accessibility | Best Practices | SEO | CLS     |
| -------------------------------------------------- | ----------- | ------------- | -------------- | --- | ------- |
| Home ES, móvil simulado                            | 92          | 100           | 100            | 100 | 0.00093 |
| Home EN, desktop, `--force-prefers-reduced-motion` | 100         | 100           | 100            | 100 | 0.00631 |

Informes HTML/JSON en `reports/`. El pequeño CLS medido está muy por debajo del umbral de 0.1; no se promete CLS absolutamente cero. Las medidas se tomaron antes del ajuste final de etiquetas accesibles y contraste del caso ÉTER, sin cambios en la composición de la home.

El código anula el cursor luminoso para puntero táctil y movimiento reducido. Framer Motion consulta la preferencia para reveals/transiciones; CSS desactiva bucles, parallax y zoom. El glow no intercepta interacción y su RAF se detiene al llegar al objetivo, al salir o perder foco.

Auditoría adicional de ambos casos de proyecto tras los ajustes de contraste: 100 en accesibilidad y 100 en buenas prácticas, en NOVA (ES) y ÉTER (EN). Informes `lighthouse-project-nova.json` y `lighthouse-project-eter.json`.

## Alcance pendiente de configuración real

- Contacto y reservas funcionan en modo demostración; no hay backend conectado.
- Dominio, correo, perfiles sociales y datos legales definitivos se configuran al publicar.
- Se ha comprobado fallback de rutas en Vite preview; las reglas incluidas deben respetarse en el alojamiento elegido.
- Metadata se actualiza en cliente. Para previews sociales por cada ruta en crawlers sin JavaScript, añadir prerender/SSR al publicar.
