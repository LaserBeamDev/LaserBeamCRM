
# LaserBeam CRM - Registro de Cambios

## [funcional_v1.9] - 2026-03-11
### Nuevo
- **Importación Masiva**: Nueva pestaña en Configuración para importar datos directamente desde Google Sheets o Excel mediante copiar/pegar.
- **Limpieza de Datos**: Opción para vaciar la base de datos de movimientos desde la configuración.

### Mejorado
- **Layout de Movimientos**: Se eliminaron los saltos de línea en la tabla de movimientos para una vista más compacta y profesional.
- **Inversión de Jerarquía Visual**: En tarjetas de Producción y Logística, el número de OT ahora es el protagonista (grande y negrita) y el cliente es secundario.
- **Fechas de Entrega Detalladas**: Se añadió la fecha exacta de entrega en las tarjetas de producción, junto al contador de días restantes.
- **Identidad Visual de Transportes**: Se asignaron colores corporativos específicos a los medios de envío (Andreani: Rojo, Via Cargo: Verde Lima, Correo Argentino: Amarillo, Uber: Negro, Taller: Verde Oscuro, Expreso: Violeta).
- **Optimización de Espacio (Tamaño Operativo)**: Rediseño de tarjetas a un tamaño "medio" que equilibra la densidad de información con la legibilidad, permitiendo ver más pedidos simultáneamente.

## [funcional_v1.8] - 2026-03-10
### Nuevo
- **Módulo de Logística Dedicado**: Nueva pantalla para gestionar despachos y entregas de forma organizada.
- **Flujo de Despacho Inteligente**: Al mover un pedido a la etapa de "Logística" en el Kanban, se abre automáticamente un modal para seleccionar el medio de envío y cargar el número de seguimiento.
- **Hoja de Ruta Agrupada**: En la sección de Logística, los pedidos se agrupan automáticamente por transporte (Andreani, Correo Argentino, Uber, etc.), facilitando la gestión masiva.
- **Cierre de Ciclo**: Botón "Marcar Entregado" en la hoja de ruta que finaliza el pedido y registra la fecha de despacho.

## [funcional_v1.7] - 2026-03-10
### Nuevo
- **Filtrado Inteligente de Imputables**: En el formulario de Nueva Operación y edición, los imputables ahora se filtran automáticamente según la Cuenta seleccionada, evitando errores de categorización.
- **Proveedores de Servicios**: Al seleccionar la cuenta "Servicios" en un Egreso, se habilita un menú desplegable con proveedores específicos (ChatGPT, Google, Edenor, etc.).

## [funcional_v1.6] - 2026-03-10
### Mejorado
- **Unificación de OT**: Las tarjetas creadas desde el botón "Nueva Solicitud" en Producción ahora utilizan el mismo formato de número de orden que las ventas (`OT-XXXX`), eliminando la distinción innecesaria entre `SR-` y `OT-`.

## [funcional_v1.5] - 2026-03-10
### Mejorado
- **Indicadores de Entrega**: Se reforzó el sistema de colores en el lateral de las tarjetas Kanban. Ahora el borde se pone rojo intenso para pedidos vencidos o que vencen hoy, y amarillo/naranja para pedidos próximos a vencer (2 días o menos).
- **Notas de Producción**: El botón de notas ahora cambia a color **verde** (emerald) cuando tiene contenido guardado, facilitando su identificación.

## [funcional_v1.4] - 2026-03-10
### Mejorado
- **Rediseño de Tarjetas Kanban**: Se movieron los botones de acción (Notas, Editar, Eliminar) a la parte inferior de la tarjeta para evitar que tapen la información de entrega.
- **Navegación Optimizada**: El botón "Volver" ahora es un ícono de flecha y el botón "Siguiente" se ha reducido de tamaño para optimizar el espacio, ubicando los botones de gestión en el centro de la fila inferior.

## [funcional_v1.3] - 2026-03-10
### Mejorado
- **Interfaz Kanban**: Los botones de acción (Notas, Editar, Eliminar) ahora son fijos y siempre visibles en las tarjetas de producción para un acceso más rápido.
- **Notas de Producción**: Se añadieron botones de "Guardar" y "Cancelar" en el modal de notas, permitiendo descartar cambios si es necesario.

## [funcional_v1.2] - 2026-03-10
### Añadido
- **Notas de Producción**: Nueva funcionalidad que permite añadir comentarios, detalles de diseño o especificaciones del cliente directamente en las tarjetas de Kanban mediante un botón dedicado y una ventana emergente.

## [funcional_v1.1] - 2026-03-10
### Corregido
- **Flujo de Producción**: Se agregaron los campos faltantes (Cuenta, Imputable, Vendedor) al confirmar una venta desde el tablero Kanban, asegurando la integridad de los datos en el historial de movimientos.

## [funcional_v1.0] - 2026-03-10
### Añadido
- **Base de Datos Local**: Migración completa de Google Sheets a `data.json` con API Express.
- **Gestión de Producción**: Tablero Kanban interactivo con Drag & Drop y alertas de entrega.
- **Inventario Avanzado**: Control de stock con alertas de reposición y vista de tarjetas.
- **AIChat Integrado**: Asistente inteligente para análisis de datos en tiempo real.
- **Sistema de Respaldos**: Funcionalidad para descargar copia de seguridad en formato JSON.
- **Configuración Dinámica**: Gestión de proveedores, vendedores y categorías desde la UI.

## [1.2.5] - 2024-05-21
### Corregido
- Refactorización de `server.js` para manejo de errores más silencioso.
- Definición de `Procfile` corregida.
- Optimización de `package.json` para despliegues directos desde GCS.
