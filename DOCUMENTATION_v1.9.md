# Documentación LaserBeam CRM v1.9

## Cambios en la Interfaz de Usuario (UI)

### 1. Jerarquía de Tarjetas (Producción y Logística)
Se ha invertido la importancia visual de los datos en las tarjetas de los tableros.
- **Antes**: El nombre del cliente era el título principal.
- **Ahora**: El número de **Orden de Trabajo (OT)** es el título principal en tamaño grande y negrita. El cliente pasa a ser un subtítulo en mayúsculas.
- **Razón**: Mejora la operatividad en el taller, donde se identifica el trabajo principalmente por su número de orden.

### 2. Información de Entrega en Producción
Se ha enriquecido la información temporal en las tarjetas de Kanban:
- Se muestra la **Fecha de Entrega Pactada** (ej: 2026-03-15).
- Se mantiene el contador de días restantes con código de colores (Rojo: Vencido/Hoy, Naranja: Próximo, Azul: Con tiempo).

### 3. Identidad Visual de Transportes (Logística)
Para una identificación rápida de los paquetes listos para despacho, se han asignado colores específicos a cada transporte:
- **Andreani**: Rojo (`rose`)
- **Via Cargo**: Verde Lima (`lime`)
- **Correo Argentino**: Amarillo (`amber`)
- **Uber**: Negro (`slate-900`)
- **Retiro en Taller**: Verde Oscuro (`emerald-800`)
- **Expreso**: Violeta (`violet`)

### 4. Rediseño de Tamaño "Operativo"
Se ajustó el tamaño de las tarjetas a un punto medio:
- Permite ver más tarjetas en pantalla que el diseño original.
- Mantiene una legibilidad superior al diseño "mini" anterior.
- Optimización de paddings y tamaños de fuente para maximizar el área de trabajo útil.

### 5. Importación y Gestión de Datos
- **Importar desde Planillas**: En la sección de Configuración > Importar, se puede pegar directamente un rango de celdas de Excel o Google Sheets.
- **Mapeo Automático**: El sistema reconoce las columnas si se incluye una fila de encabezado con los nombres técnicos de las columnas (ej: `numeroOrden`, `fecha`, `total`, etc.).
- **Vista Compacta**: La tabla de Movimientos ahora utiliza `whitespace-nowrap` para evitar saltos de línea, manteniendo la información en una sola fila por registro para una mejor lectura rápida.

## Versiones
- **App Version**: 1.3.0
- **UI Version**: v1.9 (Funcional)
