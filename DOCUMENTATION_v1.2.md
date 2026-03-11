# LaserBeam CRM - Documentación Funcional v1.2

Esta versión, denominada **funcional_v1.2**, introduce la gestión de notas de producción, permitiendo un seguimiento más detallado de cada pedido sin sobrecargar el historial de movimientos.

---

## 1. Dashboard (Panel de Control)
**Uso:** Proporciona una visión rápida y visual de la salud financiera y operativa del negocio.
- **Funcionalidades:**
    - **Métricas Clave:** Ingresos, Egresos, Utilidad y alertas de stock.
    - **Gráficos:** Ventas semanales y evolución de ingresos.

## 2. Movimientos (Historial de Transacciones)
**Uso:** Registro detallado de todas las entradas y salidas de dinero.
- **Funcionalidades:**
    - **Tabla Detallada:** Muestra ID, OT, Fecha, Tipo, Cuenta, Imputable, SKU, Monto, Estado y Contacto.
    - **Filtros:** Buscador global y filtros por Tipo y Vendedor.

## 3. Producción (Flujo Kanban)
**Uso:** Gestión del ciclo de vida de los pedidos desde la solicitud hasta la entrega.
- **Funcionalidades:**
    - **Tablero Kanban:** Columnas por etapas (Diseño, Potencial, Confirmado, Producción, Logística, Completado).
    - **Drag & Drop:** Gestión visual del progreso.
    - **Alertas de Entrega:** Indicadores visuales de urgencia.
    - **Notas de Producción (NUEVO v1.2):** Cada tarjeta incluye ahora un botón de "Mensaje" (ícono de burbuja). Al hacer clic, se abre una ventana emergente para anotar detalles técnicos, cambios de diseño o pedidos específicos del cliente. Estas notas son exclusivas de la tarjeta y no aparecen en la sección de movimientos.
    - **Confirmación de Venta:** Solicitud obligatoria de Cuenta, Imputable y Vendedor al confirmar pedidos.

## 4. Inventario (Gestión de Stock)
**Uso:** Control de existencias de productos y materias primas.
- **Funcionalidades:**
    - **Vista de Tarjetas:** Visualización clara de cada SKU.
    - **Alertas de Reposición:** Indicador visual rojo para stock bajo.

## 5. Configuración
**Uso:** Personalización de las listas desplegables y mantenimiento del sistema.
- **Funcionalidades:**
    - **Gestores de Listas:** Proveedores, Medios de Pago, Vendedores y Categorías.
    - **Respaldo de Datos:** Descarga de archivo JSON con toda la información.

## 6. AIChat (Asistente Inteligente)
**Uso:** Análisis de datos mediante lenguaje natural.
- **Funcionalidades:**
    - **Consultas de Datos:** Preguntas sobre ventas, stock o rendimiento.

## 7. Backend Local (data.json)
**Uso:** Almacenamiento persistente de la información.
- **Funcionalidades:**
    - **API Express:** Gestión de datos local.

---
**Versión:** funcional_v1.2
**Fecha:** 10 de Marzo, 2026
**Estado:** Estable / Producción Local
