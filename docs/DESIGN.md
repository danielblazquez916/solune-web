# SOLUNE — dirección y arquitectura

## Referencia analizada

Se revisaron https://dominiozero.es/, su menú, /proyectos/, /nosotros/, /contacto/, /diseno-web-coruna/, /soporte-mantenimiento-web-coruna/ y los casos /proyectos/la-tatuajeria/ y /proyectos/academia-ruth-galvan/.

La home utiliza titulares enormes con cambios de peso, piezas visuales insertadas y composición irregular. El menú ocupa la pantalla, numera destinos y mantiene servicios secundarios. Proyectos prioriza imágenes; los casos alternan imágenes a ancho completo y pares. Nosotros construye ritmo editorial con retratos y titulares. Los servicios conectan introducción, proceso, capacidades y proyectos; contacto reduce el lenguaje a un titular y formulario. El footer y las bandas de texto repetido mantienen continuidad. Se toma esa jerarquía y ritmo; ningún texto, marca ni recurso se reutiliza.

## Dirección propia

«Ideas con luz propia». Fondo #10110F, blanco #F5F3EC, amarillo #FFD84A, secundario #A8AAA1. Halo orbital original construido en CSS, líneas técnicas y numeración discreta. Manrope variable para titulares y cuerpo; Space Grotesk para metadatos. ÉTER introduce Cormorant Garamond y composiciones cálidas; NOVA emplea Manrope y una retícula clínica azul/marfil.

Escala de espacios: 8, 16, 24, 40, 64, 96, 144 px. Márgenes fluidos 20–72 px. Titulares fluidos; móvil recompone columnas y mockups. Movimiento: reveals 550 ms, transiciones 350 ms, hover 250 ms, marquee lento con pausa accesible. Reduced motion anula desplazamientos y bucles. Scroll nativo.

## Sitemap

- / — hero, selected work, servicios, manifiesto, CTA.
- /nosotros — enfoque, valores, proceso, herramientas.
- /proyectos — dos conceptos identificados explícitamente.
- /proyectos/:slug — nueve secciones de guía de marca y UI, prototipos interactivos, navegación siguiente/anterior.
- /servicios — índice de cinco disciplinas.
- /servicios/:slug — diseño web, desarrollo web, UI/UX, integraciones, mantenimiento; capacidades y procesos específicos.
- /contacto — formulario con validación y adaptador API.
- /privacidad — explicación real del tratamiento en modo demostración.
- * — 404 recuperable.

## Implementación

React + TypeScript + Vite, BrowserRouter de react-router-dom, Framer Motion. Layout persistente; páginas con carga diferida. Datos tipados de proyectos y servicios. UI y mockups compartidos solo donde existe un patrón real. Metadatos mediante elementos nativos de React 19. Formularios sin backend en modo demostración, sin persistencia de datos personales. Rewrites incluidos para subrutas en alojamiento estático. Los proyectos son ficticios y las fotografías se utilizan como referencias visuales, no como equipo real.
