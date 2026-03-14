# Documentación Funcional: LaserBeam CRM v2.0

## 1. Descripción General
LaserBeam CRM es una plataforma integral de gestión diseñada específicamente para negocios de diseño y corte láser. Combina la gestión financiera (Ingresos/Egresos), el seguimiento de producción (Kanban), el control de inventario y la logística de despachos en una interfaz moderna y brutalista.

## 2. Módulos Principales

### 2.1. Dashboard (Panel de Control)
*   **Indicadores Clave (KPIs):** Visualización de Ingresos, Egresos y Utilidad (Neto) calculados en ventanas de 7 días, mes actual y últimos 30 días.
*   **Cálculo de Margen:** Porcentaje de utilidad sobre ingresos.
*   **Gráfico de Ventas:** Visualización de barras de los últimos 7 días.
*   **Alertas de Stock:** Notificación inmediata de productos por debajo del stock mínimo.
*   **Filtro de Ajustes:** Exclusión automática de movimientos de "Ajuste Cuentas" de las estadísticas de ventas para evitar duplicaciones por traspasos internos.

### 2.2. Gestión de Movimientos (Ventas y Gastos)
*   **Registro Multitem:** Capacidad de cargar órdenes con múltiples SKUs.
*   **Atributos de Transacción:** Fecha, Cuenta, Imputable, Medio de Pago, Concepto (Seña/Saldo/Total), Estado y Vendedor.
*   **Detección de Clientes/Proveedores:** Lógica inteligente para identificar si el contacto es un cliente (Ingreso) o proveedor (Egreso).

### 2.3. Producción (Tablero Kanban)
*   **Flujo de Trabajo:** 6 etapas definidas:
    1. Diseño Solicitado
    2. Pedido Potencial
    3. Pedido Confirmado
    4. Máquina/Producción
    5. Logística
    6. Completado
*   **Gestión de Prioridades:** Sistema de drag-and-drop para reordenar tarjetas y establecer prioridades visuales.
*   **Alertas de Entrega:** Código de colores basado en la fecha pactada (Vencido, Hoy, Próximo).
*   **Lógica de Confirmación:** Solo los pedidos en "Pedido Confirmado" o superiores computan como ingresos reales.

### 2.4. Logística y Despachos
*   **Vista Especializada:** Enfocada en la preparación de paquetes.
*   **Integración de Seguimiento:** Carga de medios de envío (Correo Argentino, Andreani, Motomensajería, etc.) y números de tracking.
*   **Diseño de "Postal":** Interfaz optimizada para lectura rápida de datos de envío.

### 2.5. Inventario (Stock)
*   **Control de SKU:** Gestión de stock base y stock actual calculado dinámicamente.
*   **Alertas Visuales:** Resaltado de ítems críticos.
*   **Sincronización:** El stock se descuenta automáticamente cuando una orden de ingreso pasa a estado "Completado".

### 2.6. Importador Mercado Pago
*   **Procesamiento CSV:** Lectura de reportes estándar de Mercado Pago.
*   **Mapeo Inteligente:** Clasificación automática de gastos comunes:
    *   **Publicidad:** Facebook.
    *   **Servicios:** Canva (Zilver SA), ChatGPT (OpenAI), Trello, TiendaNube, Telefonía.
    *   **Impuestos:** ARCA (Monotributo), Comisiones ML.
    *   **Logística:** Andreani, MiCorreo.

## 3. Lógica de Negocio Crítica
*   **Ajustes de Cuenta:** Los movimientos marcados como "Ajuste" se consideran transferencias de fondos. Se registran en el historial pero se omiten de los reportes de rentabilidad.
*   **Persistencia:** Sistema híbrido con almacenamiento local (IndexedDB/LocalStorage) y sincronización opcional con Google Sheets como backup en la nube.

---

# Prompt Maestro para Lovable / Re-creación

**Copia y pega el siguiente prompt para recrear esta aplicación con precisión técnica:**

```markdown
Actúa como un Ingeniero de Software Senior y Diseñador de Producto. Crea una aplicación CRM Full-Stack llamada "LaserBeam CRM v2.0" con una estética "Modern Brutalist" (paleta Slate/Indigo/Emerald, bordes redondeados XL, sombras suaves, tipografía Inter y JetBrains Mono).

### Requerimientos Técnicos:
1. **Stack:** React, Tailwind CSS, Lucide-React para iconos, Recharts para analítica, y una capa de persistencia robusta (simula una integración con Google Sheets mediante JSON).
2. **Dashboard:** 
   - 4 tarjetas de stats: Ingresos, Egresos, Utilidad y Bajo Stock.
   - Gráfico de barras de ingresos de los últimos 7 días.
   - Lista de movimientos recientes con iconos diferenciados por tipo.
3. **Sistema de Transacciones:**
   - Soporte para Ingresos y Egresos.
   - Cada transacción debe tener: ID, Fecha, Cuenta, Imputable, SKU (o lista de items), Total, Medio de Pago, Cliente/Proveedor, Detalle y Etapa.
   - Lógica especial: Si el imputable contiene la palabra "Ajuste", excluir el monto de los totales de ingresos/egresos del dashboard (tratar como transferencia interna).
4. **Tablero Kanban de Producción:**
   - Columnas: Diseño Solicitado, Pedido Potencial, Pedido Confirmado, Máquina/Producción, Logística, Completado.
   - Funcionalidad Drag-and-Drop para mover entre etapas y reordenar prioridad.
   - Las tarjetas deben mostrar urgencia según la "Fecha de Entrega" (Rojo si venció, Ámbar si falta poco).
5. **Módulo de Logística:**
   - Vista de tarjetas tipo "Postal" para pedidos en etapa Logística.
   - Campos para seleccionar Medio de Envío y cargar Tracking Number.
6. **Gestión de Inventario:**
   - Tabla de productos con SKU, Nombre, Stock Actual y Stock Mínimo.
   - Alerta visual si Stock Actual <= Stock Mínimo.
   - Descontar stock automáticamente cuando una venta pasa a "Completado".
7. **Importador de Mercado Pago:**
   - Componente para subir archivos CSV.
   - Lógica de mapeo: 
     - "Facebook" -> Publicidad.
     - "ARCA" -> Impuestos/Monotributo.
     - "Trello" -> Servicios/Suscrip.
     - "Andreani/MiCorreo" -> Logística.
     - "OpenAI/ChatGPT/Canva" -> Servicios.
8. **UX/UI:**
   - Navegación lateral (Sidebar) colapsable en móvil.
   - Feedback visual de "Sincronizado" (punto verde con glow).
   - Formulario de "Nuevo Movimiento" modal o sección dedicada con búsqueda de SKUs.
```
