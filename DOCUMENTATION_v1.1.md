# LaserBeam CRM - Documentación Funcional v1.1

Esta versión, denominada **funcional_v1.1**, incluye mejoras en la integridad de datos durante el flujo de producción, además de todas las capacidades de la v1.0.

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
    - **Drag & Drop:** Arrastra tarjetas entre columnas para cambiar su etapa.
    - **Alertas de Entrega:** Las tarjetas cambian de color según la proximidad de la fecha de entrega.
    - **Confirmación de Venta (MEJORA v1.1):** Al mover un pedido a "Pedido Confirmado", el sistema ahora solicita obligatoriamente la **Cuenta**, **Imputable** y **Vendedor**, asegurando que la transacción se registre completa en el historial de movimientos.
- **Cómo utilizarlo:** Cuando un pedido potencial se concreta, arrástralo a "Confirmado". Completa los datos financieros en la ventana emergente para que la venta impacte correctamente en tus reportes.

## 4. Inventario (Gestión de Stock)
**Uso:** Control de existencias de productos y materias primas.
- **Funcionalidades:**
    - **Vista de Tarjetas:** Visualización clara de cada SKU con su cantidad actual.
    - **Alertas de Reposición:** Indicador visual rojo cuando el stock es bajo.
    - **Edición de Stock:** Permite ajustar manualmente la cantidad y el stock mínimo.
- **Cómo utilizarlo:** Revisa esta sección para planificar compras de insumos. Haz clic en editar para actualizar existencias tras recibir mercadería.

## 5. Configuración
**Uso:** Personalización de las listas desplegables y mantenimiento del sistema.
- **Funcionalidades:**
    - **Gestores de Listas:** Personaliza Proveedores, Medios de Pago, Vendedores y Categorías.
    - **Respaldo de Datos:** Descarga un archivo JSON con toda la información.
- **Cómo utilizarlo:** Mantén actualizadas tus listas de vendedores y categorías para que la carga de datos sea rápida y precisa.

## 6. AIChat (Asistente Inteligente)
**Uso:** Análisis de datos mediante lenguaje natural.
- **Funcionalidades:**
    - **Consultas de Datos:** Pregunta sobre ventas, stock o rendimiento.
    - **Contexto Real:** Acceso directo a transacciones y stock.
- **Cómo utilizarlo:** Usa el chat para obtener insights rápidos como "¿Quién es mi mejor vendedor?" o "¿Qué SKUs debo reponer hoy?".

## 7. Backend Local (data.json)
**Uso:** Almacenamiento persistente de la información.
- **Funcionalidades:**
    - **API Express:** Gestión de datos local sin dependencia de la nube.
- **Cómo utilizarlo:** El sistema guarda todo en `data.json`. Puedes copiar este archivo para realizar backups manuales externos.

---
**Versión:** funcional_v1.1
**Fecha:** 10 de Marzo, 2026
**Estado:** Estable / Producción Local
