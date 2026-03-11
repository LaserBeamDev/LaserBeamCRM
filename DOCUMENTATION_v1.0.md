# LaserBeam CRM - Documentación Funcional v1.0

Esta versión, denominada **funcional_v1.0**, representa el estado estable del CRM con base de datos local y gestión integral de producción e inventario.

---

## 1. Dashboard (Panel de Control)
**Uso:** Proporciona una visión rápida y visual de la salud financiera y operativa del negocio.
- **Funcionalidades:**
    - **Métricas Clave:** Visualización de Ingresos, Egresos, Utilidad (con margen porcentual) y cantidad de productos con bajo stock.
    - **Gráficos:** Gráfico de barras para ventas semanales y gráfico de área para la evolución de ingresos.
- **Cómo utilizarlo:** Es la pantalla de inicio por defecto. Úsala para monitorear si los ingresos superan a los egresos y detectar alertas de stock de forma inmediata.

## 2. Movimientos (Historial de Transacciones)
**Uso:** Registro detallado de todas las entradas y salidas de dinero.
- **Funcionalidades:**
    - **Tabla Detallada:** Muestra ID, OT (Orden de Trabajo), Fecha, Tipo (Ingreso/Egreso), Cuenta, Imputable, SKU, Monto, Estado y Contacto.
    - **Filtros:** Buscador global (por OT, Cliente, SKU) y filtros por Tipo y Vendedor.
    - **Sincronización:** Botón "Refrescar Datos" para asegurar que la vista coincide con el servidor local.
- **Cómo utilizarlo:** Para buscar una venta pasada o revisar los gastos de un proveedor específico. Utiliza el buscador para filtrar rápidamente por número de orden o nombre de cliente.

## 3. Producción (Flujo Kanban)
**Uso:** Gestión del ciclo de vida de los pedidos desde la solicitud hasta la entrega.
- **Funcionalidades:**
    - **Tablero Kanban:** Columnas por etapas (Diseño, Potencial, Confirmado, Producción, Logística, Completado).
    - **Drag & Drop:** Arrastra tarjetas entre columnas para cambiar su etapa. También permite reordenar por prioridad dentro de la misma columna.
    - **Alertas de Entrega:** Las tarjetas cambian de color según la proximidad de la fecha de entrega (Rojo: Retrasado/Hoy, Ámbar: Próximo).
    - **Acciones Rápidas:** Botón "Nueva Solicitud" para crear pedidos rápidos, edición directa y eliminación.
- **Cómo utilizarlo:** Cuando entra un pedido, créalo como "Diseño Solicitado". A medida que el trabajo avanza en el taller, arrastra la tarjeta a la derecha. Al pasar de "Pedido Potencial" a "Confirmado", el sistema te pedirá confirmar el monto y medio de pago.

## 4. Inventario (Gestión de Stock)
**Uso:** Control de existencias de productos y materias primas.
- **Funcionalidades:**
    - **Vista de Tarjetas:** Visualización clara de cada SKU con su cantidad actual.
    - **Alertas de Reposición:** Indicador visual rojo y animación cuando el stock es igual o menor al mínimo configurado.
    - **Buscador de SKUs:** Filtro rápido por código o nombre.
    - **Edición de Stock:** Permite ajustar manualmente la cantidad y el stock mínimo de alerta.
- **Cómo utilizarlo:** Revisa esta sección diariamente para ver qué materiales (Vasos, Mates, etc.) necesitas reponer. Haz clic en el icono de editar en una tarjeta para actualizar las existencias tras una compra de insumos.

## 5. Configuración
**Uso:** Personalización de las listas desplegables y mantenimiento del sistema.
- **Funcionalidades:**
    - **Gestores de Listas:** Permite añadir o quitar Proveedores, Medios de Pago, Vendedores y Categorías (Cuentas/Imputables).
    - **Respaldo de Datos:** Botón para descargar un archivo JSON con toda la información del CRM.
- **Cómo utilizarlo:** Si contratas un nuevo vendedor o empiezas a trabajar con un nuevo proveedor, añádelo aquí para que aparezca en los formularios de venta. Descarga un respaldo semanalmente para tener una copia de seguridad externa.

## 6. AIChat (Asistente Inteligente)
**Uso:** Análisis de datos mediante lenguaje natural.
- **Funcionalidades:**
    - **Consultas de Datos:** Pregunta cosas como "¿Cuál fue el producto más vendido?" o "¿Cuánto ganamos este mes?".
    - **Contexto Real:** El chat tiene acceso a tus transacciones y stock actual para dar respuestas precisas.
- **Cómo utilizarlo:** Haz clic en el icono flotante del chat y escribe tus dudas operativas. Es ideal para obtener reportes rápidos sin tener que filtrar tablas manualmente.

## 7. Backend Local (data.json)
**Uso:** Almacenamiento persistente de la información.
- **Funcionalidades:**
    - **API Express:** Maneja las peticiones del frontend y guarda los cambios en el archivo `data.json` en la raíz del proyecto.
- **Cómo utilizarlo:** No requiere intervención manual, pero saber que existe te permite copiar el archivo `data.json` para mover tus datos a otra instalación si fuera necesario.

---
**Versión:** funcional_v1.0
**Fecha:** 10 de Marzo, 2026
**Estado:** Estable / Producción Local
