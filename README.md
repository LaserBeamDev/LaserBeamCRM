# LaserBeam CRM v2.0 🚀

Sistema integral de gestión (CRM) diseñado específicamente para negocios de diseño y corte láser. Esta aplicación permite gestionar finanzas, producción, inventario y logística en una interfaz moderna y eficiente.

## 🌟 Características Principales

- **Dashboard Inteligente:** Visualización en tiempo real de ingresos, egresos, utilidad y alertas de stock.
- **Gestión de Producción (Kanban):** Flujo de trabajo desde el diseño hasta la entrega final.
- **Control de Inventario:** Seguimiento de SKUs con alertas de stock mínimo y descuento automático al completar ventas.
- **Logística y Despachos:** Gestión de envíos con integración de tracking y diseño de tarjetas postales.
- **Importador de Mercado Pago:** Automatización de la carga de gastos y servicios (ARCA, Trello, Andreani, etc.).
- **Filtro de Ajustes:** Inteligencia financiera que excluye traspasos internos de las métricas de rentabilidad.

## 📂 Lógica de Importación de Datos

La aplicación cuenta con motores de importación robustos para facilitar la migración de datos desde fuentes externas (Google Sheets, Excel, Mercado Pago).

### 1. Importador General de Transacciones (`src/App.tsx`)
Ubicado en la función `importTransactions`, este motor incluye:
- **Mapeo Inteligente de Campos:** Normaliza automáticamente columnas como "monto", "importe", "total venta", "caja", "cuenta", etc.
- **Detección Automática de Cabeceras:** Escanea las primeras filas del archivo para encontrar la fila de títulos.
- **Limpieza de Datos Numéricos:** Soporta formatos regionales (puntos y comas para miles/decimales) y símbolos de moneda.
- **Parseo de Fechas Multiformato:** Detecta y convierte formatos YYYY-MM-DD y MM/DD/YYYY.
- **Lógica de Etapas:** Asigna automáticamente la etapa de producción (Completado vs. Producción) basándose en si el pago es una "Seña" o el "Total".
- **Soporte Multitem:** Procesa listas de productos en formato JSON o abreviado (ej: `2xSKU1, 1xSKU2`).

### 2. Importador de Mercado Pago (`src/components/MercadoPagoImporter.tsx`)
Especializado en reportes de liquidación de Mercado Pago:
- **Categorización Automática:** Clasifica gastos por palabras clave (Facebook -> Publicidad, ARCA -> Impuestos, Andreani -> Logística).
- **Normalización de Montos:** Ajusta los montos netos de las transacciones para reflejar el impacto real en caja.

## 🛠️ Tecnologías

- **Frontend:** React + TypeScript + Tailwind CSS
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Persistencia:** Sistema híbrido (Local + Sincronización en Nube)

## 📝 Versiones

- **v2.0 (Actual):** Versión estable con filtros financieros avanzados y mapeo extendido de servicios.
- **v1.9:** Introducción del sistema de ajustes de cuenta y mejoras en el Kanban.

---
*Desarrollado para LaserBeam - Diseño + Corte Láser*
