# 📜 Historial de Cambios (Changelog) - Sokka CRM

Todos los cambios notables en la plataforma Sokka CRM quedan documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Unreleased]
- Proximas mejoras de diseño de identidad de marca Sokka Estudio en propuestas PDF.

---

## [1.0.0] - 2026-08-11

### 🚀 Añadido (Feat)
- **Fase 0: Migración a la Nube (Turso DB)**:
  - Integración de `@libsql/client` para sincronización en la nube con **Turso Cloud SQLite**.
  - Script de auto-migración de esquema y seeding automático de usuarios iniciales (`admin@sokka.com`, `manager@sokka.com`, `vendedor@sokka.com`).

- **Fase 1: Campos Comerciales de Agencia B2B**:
  - `clientStatus` en empresas (`prospect`, `active_client`, `ex_client`, `lost`).
  - `leadSource` en contactos y negocios (Instagram, LinkedIn, Facebook, Referido, Google Ads, etc.).
  - `dealType` en oportunidades (`project` puntual vs `retainer` mensual).
  - Editor de **Brief Estratégico** (`BriefEditor.tsx`) con guardado automático en vivo para clientes y negocios.

- **Fase 2: Dashboard Comercial con Métricas en ARS**:
  - Indicadores clave KPI: MRR Activo (Retainers), Ingresos Ganados del Mes en ARS y Tasa de Conversión (%).
  - Gráfico de barra SVG para distribución del embudo por etapas (`BarChart.tsx`).
  - Gráfico circular/distribución SVG por canal de atracción de leads (`PieChart.tsx`).
  - Tabla de detección de **Oportunidades Frías** (> 7 días 🟡 / > 14 días 🔴).
  - Ranking de vendedores (*Top Sellers Leaderboard*).

- **Fase 3: Sistema de Etiquetas Globales (Tags)**:
  - Tablas relacionales `tags`, `contact_tags` y `company_tags`.
  - Panel de administración global de etiquetas para Administradores y Gerentes (`/settings/tags`).
  - Componente interactivo `TagSelector` con paleta de colores y creación rápida de etiquetas *inline*.
  - Asignación de etiquetas en perfiles de Empresas y Contactos.

- **Fase 4: Catálogo Corporativo de Servicios e Impresión de Propuestas PDF**:
  - Módulo ABM de catálogo de servicios (`/settings/services`) con categorías, precios sugeridos en ARS, edición y borrado.
  - Editor de cotización desglosada en la ficha de cada negocio (`DealServiceItemsSection.tsx`) con recálculo automático del total en ARS.
  - Generador e impresión ejecutiva de **Propuestas Comerciales en PDF** (`/deals/[id]/proposal`) con membrete de Sokka Estudio, resumen estratégico, desglose comercial, términos y bloque de firmas.

- **Fase 5: Usabilidad & Almacenamiento en la Nube**:
  - **Buscador Global (`Ctrl + K` / `Cmd + K`)**: Modal interactivo para búsqueda en tiempo real de contactos, empresas u oportunidades desde cualquier pantalla.
  - **Insignias Kanban**: Marcadores en tiempo real 🟡 (7 días) y 🔴 (14 días) en las tarjetas del embudo de ventas.
  - **Adjuntos con Firebase Storage**: Componente `FileUploadUploader.tsx` integrado al registrador de actividades para subir PDFs, presentaciones y briefs a la nube con barra de progreso.

### 🛡️ Seguridad (Security)
- Creación de `.gitignore` para garantizar la protección absoluta de claves de API, tokens de Turso y credenciales de Firebase (`.env.local`).
- Publicación del código fuente inicial en el repositorio privado de GitHub: [`https://github.com/conra1298/sokka-crm`](https://github.com/conra1298/sokka-crm).
