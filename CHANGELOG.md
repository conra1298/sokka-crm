# 📜 Historial de Cambios (Changelog) - Sokka CRM

Todos los cambios notables en la plataforma Sokka CRM quedan documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [1.1.0] - 2026-08-19

### 🚀 Añadido (Feat)
- **Módulo de Finanzas Integral (`/finances`)**:
  - Exclusivo para usuarios con rol `admin`.
  - **Dashboard Ejecutivo con Gráficos Interactivos (`recharts`)**:
    - **Flujo de Caja Anual**: Comparativa visual mensual de Ingresos Cobrados, Ingresos Pendientes y Egresos.
    - **Estado de Cobranzas Mensual**: Barra de progreso y desglose de montos/clientes cobrados vs pendientes según el período de facturación.
    - **Distribución de Gastos por Categoría**: Gráfico Donut con segmentación porcentual y colores por etiqueta.
    - **Tarjetas KPI**: Resumen anual de ingresos, gastos, margen neto operativo y total por cobrar del mes.
  - **Control de Cobranzas e Ingresos**:
    - Registro detallado por cliente, período (mes/año), fecha de pago, monto ($ ARS), estado de pago y estado de facturación.
  - **Control de Egresos y Gastos**:
    - Registro de salidas de dinero categorizadas por conceptos/etiquetas.
  - **Gestión de Categorías / Etiquetas**:
    - Alta y administración de etiquetas personalizadas de gastos con selector de color.
- **Acceso Rápido y Seguridad**:
  - Acceso restringido en backend y frontend exclusivo para Administradores.
  - Enlace al módulo de Finanzas en la barra de navegación lateral.

### 🛠️ Correcciones (Fix)
- Corrección de visualización del logo corporativo en la pantalla de inicio de sesión (`/login`).
- Actualización de configuración del dialecto Turso en `drizzle.config.ts`.

---

## [1.0.6] - 2026-08-15

### 🚀 Añadido (Feat)
- **Filtro de Ordenamiento Rápido en Embudo**:
  - Selector de ordenación por Ticket más alto (`$ Mayor valor`), Ticket más bajo (`$ Menor valor`), Más recientes (`Último agregado`) y Más antiguos.
- **Modo Vista Compacta de Tarjetas**:
  - Botón selector para alternar entre "Vista Detallada" y "Vista Compacta".
  - En modo compacto, las tarjetas reducen su tamaño vertical en más del 60%, mostrando únicamente el Nombre de la Oportunidad, Empresa vinculada y Monto.
- **Reordenamiento Manual Personalizado Libre**:
  - Capacidad de arrastrar y soltar libremente las tarjetas para acomodarlas en cualquier orden dentro de la misma columna o entre diferentes etapas del embudo comercial (`@dnd-kit/sortable` con `arrayMove`).

---

## [1.0.5] - 2026-08-15

### 🚀 Añadido (Feat)
- **Desplazamiento Horizontal por Arrastre en Tablero Kanban (Drag-to-Scroll)**:
  - Posibilidad de arrastrar con clic sostenido sobre cualquier fondo o espacio libre del tablero de oportunidades para desplazarse horizontalmente a lo largo de las etapas sin tener que bajar a buscar la barra de scroll inferior.
  - Indicador de cursor intuitivo (`grab` / `grabbing`).

---

## [1.0.4] - 2026-08-15

### 🚀 Añadido (Feat)
- **Edición Integral de Clientes Activos & Oportunidades**:
  - Botón directo **"Editar"** en cada fila de la tabla de `/clients` para corregir nombre del servicio, fee ($ ARS), día de cobro, Account Manager y vincular empresas (solucionando registros desvinculados de *"Cliente Sin Empresa"*).
  - Modal de edición completa en la ficha de detalle de oportunidades (`/deals/[id]`).
- **Edición Integral de Empresas (`/companies/[id]`)**:
  - Modal para modificar nombre, industria/rubro, sitio web, teléfono, redes sociales, estado de cliente y responsable asignado.
- **Edición Integral de Contactos (`/contacts/[id]`)**:
  - Modal para actualizar nombre, apellido, correo electrónico, teléfono, empresa vinculada, cargo y responsable.
- **Integración de WhatsApp Directo**:
  - Botón de acceso directo para abrir chat de WhatsApp con 1 clic en fichas de empresas y contactos con teléfono registrado.

---

## [1.0.3] - 2026-08-15

### 🚀 Añadido (Feat)
- **Módulo Dedicado 'Clientes Activos' (`/clients`)**:
  - Nuevo acceso directo en el menú lateral principal con ícono de recurrencia (`RefreshCcw`).
  - Panel ejecutivo con métricas de **MRR Total en ARS**, cantidad de cuentas activas y ticket promedio (ARPU).
  - Tabla de seguimiento de servicios fijos/retainers con día de cobro/facturación, Account Manager asignado y accesos directos.
  - Modal de alta rápida en 1 solo paso (`ClientCreateModal.tsx`) para cargar empresas y retainers sin necesidad de pasar por el embudo de prospección.
  - Sincronización automática de estado de empresa a `Cliente Activo` (`clientStatus = 'active_client'`).
  - Impacto directo en tiempo real sobre los KPIs comerciales del Dashboard.

### 💄 Cambios (UI & UX)
- **Embudo de Ventas**: Se mantuvo el foco exclusivo en prospección y negociación de nuevas oportunidades (vistas Tablero Kanban y Tabla).

---

## [1.0.2] - 2026-08-13

### 🚀 Añadido (Feat)
- **Producción**: Despliegue automatizado continuo vía Vercel conectado al repositorio de GitHub (`sokka-crm.vercel.app`).
- **Limpieza de Entorno**: Nuevo script (`clear-data.ts`) ejecutado en Turso Cloud para purgar las oportunidades, empresas, contactos y tareas de prueba de Sokka, dejando el CRM limpio para su uso real manteniendo el catálogo y los usuarios.

### 💄 Cambios (UI & UX)
- **Inicio de Sesión**: Interfaz minimalista. Se removieron los botones de autocompletado para cuentas de prueba y se ajustó el branding (logo ampliado con leyenda "Evolucionando").

### 🔧 Correcciones (Fixes)
- **Vulnerabilidad**: Actualización de Next.js (`v16.3.0`) para solucionar el bloqueo de seguridad (CVE-2025-66478) emitido por Vercel durante el despliegue.
- **Tipado**: Corrección de error de validación estricta de TypeScript en scripts de base de datos (`reset-users.ts`) que bloqueaban la compilación.

---

## [1.0.1] - 2026-08-12

### 💄 Cambios (UI & UX)
- **Logo de Sokka**: Reemplazo del avatar genérico por el logo oficial (`logo-app.svg`) en la pantalla de Inicio de Sesión (`/login`).
- **Etiquetas Visibles en Listados**: Las etiquetas asignadas ahora se muestran como *badges* de colores directamente en los listados del directorio de Empresas y Contactos, facilitando la visualización sin entrar al detalle.
- **Propuestas Comerciales (PDF)**:
  - Optimización de márgenes y espacios de impresión (`@media print`) para evitar que la hoja se extienda en forma apaisada y para separar el texto de los bordes.
  - El presentador de la propuesta toma dinámicamente el nombre del propietario asignado al negocio, sustituyendo automáticamente el nombre "Conrado Backup" por "Conrado Giampaoletti".

### 🔧 Correcciones (Fixes)
- **Base de Datos**: Corrección del script de usuarios (`reset-users.ts`) para sincronizarse con Turso DB inyectando explícitamente el token y URL de producción.
- **Drizzle ORM**: Se agregaron las relaciones faltantes `companyTags` y `contactTags` al schema para evitar cierres inesperados (crash) en el listado de empresas y contactos.

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
