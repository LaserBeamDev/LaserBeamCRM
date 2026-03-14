# Changelog: LaserBeam CRM v2.0

Esta versión marca la transición de un prototipo funcional a una herramienta de gestión estable y precisa para **LaserBeam**.

## 🚀 Novedades de la Versión 2.0 (vs v1.9)

### 1. Inteligencia Financiera y Filtro de Ajustes
*   **Exclusión de Traspasos Internos:** Se implementó una lógica de filtrado para movimientos marcados como **"Ajuste Cuentas"**. 
    *   **Impacto:** Estos movimientos ya no inflan las estadísticas de Ventas, Gastos ni Utilidad en el Dashboard.
    *   **Precisión:** El margen de ganancia y los totales mensuales ahora reflejan la actividad comercial real, ignorando los movimientos de dinero entre cuentas o a efectivo.
*   **Limpieza de Kanban:** Los ajustes de cuenta ya no aparecen en el tablero de producción, manteniendo el foco exclusivamente en órdenes de trabajo.

### 2. Importador de Mercado Pago (Mapeo Extendido)
Se agregaron reglas de detección automática para nuevos servicios críticos reportados por el usuario:
*   **ARCA (Ex-AFIP):** Detección de "Pago de servicio ARCA". Se imputa automáticamente a **Impuestos > Monotributo Julian**.
*   **Trello / Atlassian:** Detección de suscripciones de software. Se imputa a **Servicios > Servicios/Suscrip.**
*   **Logística Andreani:** Detección de pagos a Andreani. Se imputa a **Costos Operativos > Logística**.

### 3. Estabilidad y UI
*   **Etiquetado de Versión:** Actualización de toda la interfaz y metadatos del proyecto a la **v2.0 (Estable)**.
*   **Validación de Compilación:** Se realizaron pruebas de linting y build para asegurar que el sistema sea robusto para el uso diario.

### 4. Documentación y Portabilidad
*   **Documentación Funcional:** Creación del archivo `DOCUMENTACION_FUNCIONAL.md` que describe la arquitectura completa de la app.
*   **Master Prompt:** Inclusión de un prompt técnico detallado para permitir la recreación o migración de la aplicación a otras plataformas (como Lovable) manteniendo todas las reglas de negocio actuales.

---
**LaserBeam CRM - Gestión de Diseño + Corte Láser**
*Versión Estable 2.0.0*
