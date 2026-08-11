---
name: Sokka Estudio
colors:
  primary: "#274283"
  secondary: "#5CB2D4"
  accent-1: "#EDA143"
  accent-2: "#EB7638"
  surface: "#ffffff"
  surface-light: "#F8FAFC"
  on-primary: "#ffffff"
  on-accent-2: "#ffffff"
  text-primary: "#0f172a"
  text-secondary: "#475569"
typography:
  display:
    fontFamily: Garet, sans-serif
    fontWeight: "700"
  body:
    fontFamily: Outfit, sans-serif
    fontWeight: "400"
rounded:
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  2xl: 1rem
  3xl: 1.5rem
  full: 9999px
spacing:
  section-y: 6rem
  section-y-mobile: 4rem
components:
  glass-card:
    backgroundColor: rgba(255, 255, 255, 0.7)
    backdropFilter: blur(12px)
    border: 1px solid rgba(255, 255, 255, 0.3)
    rounded: "{rounded.2xl}"
  button-primary:
    backgroundColor: "{colors.accent-2}"
    textColor: "{colors.on-accent-2}"
    padding: 0.75rem 2rem
    rounded: "{rounded.full}"
    hoverTransform: translateY(-2px)
  cookie-banner:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.3xl}"
---

## Overview
Sokka Estudio es una agencia de marketing estratégico argentina. El sistema de diseño refleja una estética minimalista, premium y profesional, utilizando un enfoque de *glassmorphism sutil* sobre un fondo claro, complementado por acentos de color vibrantes que dirigen la atención del usuario a las acciones principales.

## Colors
La paleta de Sokka se compone de un color institucional fuerte contrastado con colores de acento vibrantes para CTAs y elementos destacados.
- **Primary (`#274283`)**: Azul oscuro institucional. Se usa para tipografía de titulares, fondos de tooltips y elementos de alta jerarquía.
- **Secondary (`#5CB2D4`)**: Azul claro/celeste. Sirve como color de apoyo y transiciones.
- **Accent-1 (`#EDA143`)**: Amarillo/dorado. Añade calidez y variedad visual en íconos o etiquetas.
- **Accent-2 (`#EB7638`)**: Naranja vibrante. Es el color principal para botones y Calls to Action (CTAs). Su estado *hover* se oscurece ligeramente a `#d15f2a`.
- **Background Light (`#F8FAFC`)**: Fondo claro general para dar respiro al diseño.

## Typography
- **Headlines / Display**: `Garet, sans-serif`. Usada para títulos (`h1`, `h2`, `h3`). Aporta carácter y modernidad.
- **Body**: `Outfit, sans-serif`. Usada para párrafos, botones y texto de interfaz por su legibilidad excepcional.
El escalado se gestiona mediante las clases de utilidad de Tailwind CSS (`text-sm`, `text-lg`, `text-5xl`, `text-7xl`, etc.).

## Layout
El sitio está estructurado con:
- Landing page principal que actúa como hub (Hero, Servicios, Contacto).
- Páginas de servicios detalladas (Performance, Branding, Social Media).
- Secciones de soporte (FAQ, Legal, Cookies).
- **`.section-padding`**: Establece un margen interno vertical (`padding-y`) consistente de `6rem` en desktop y `4rem` en móvil.

## Elevation & Depth
La profundidad se maneja con sombras suaves propias de Tailwind CSS (`shadow`, `shadow-md`, `shadow-xl`) y con el efecto **Glassmorphism**:
- En lugar de usar sombras pesadas, los elementos superpuestos emplean desenfoque de fondo (`backdrop-blur`) y fondos semitransparentes para separar capas, logrando un aspecto limpio.

## Shapes
- **Botones Primarios**: Tienen bordes completamente redondeados (`rounded-full`, 9999px) para invitar a la interacción.
- **Tarjetas y Contenedores**: Utilizan radios amplios (`rounded-2xl`, `rounded-3xl` / 1rem a 1.5rem) que suavizan la interfaz general y combinan con el estilo moderno.

## Components
- **`.glass-card`**: Tarjeta con fondo blanco al 70% de opacidad, filtro de desenfoque de 12px y un borde blanco sutil al 30%.
- **`.btn-primary`**: Botón de llamada a la acción en color naranja (`#EB7638`), texto blanco, padding interno amplio y animación en *hover* que lo eleva (`translateY(-2px)`).
- **Tooltips**: De fondo azul primario (`#274283`) para alto contraste en explicaciones o ayudas visuales.
- **Cookie Banner**: Flotante, anclado en la parte inferior, con fondo blanco, sombras y bordes redondeados a `1.5rem`.

### Animations
- **`.fade-in-up`**: Animación de entrada estándar para elementos al hacer scroll. Se trasladan desde abajo (`translateY(30px)`) hacia su posición original (`0`) mientras su opacidad pasa de `0` a `1`, con una curva de transición suave (`cubic-bezier(0.21, 0.47, 0.32, 0.98)`).

## Do's and Don'ts
- **Do**: Usa el botón primario naranja (`#EB7638`) únicamente para las acciones principales que deseas que realice el usuario.
- **Do**: Mantén un respiro generoso (whitespace) utilizando `.section-padding` para que el contenido no se sienta apretado.
- **Don't**: No abuses del *glassmorphism*. Debe reservarse para tarjetas destacadas, fondos de menús flotantes o banners sobrepuestos a imágenes/patrones.
- **Don't**: No uses la fuente `Garet` para bloques largos de texto o párrafos; es exclusiva para titulares.
