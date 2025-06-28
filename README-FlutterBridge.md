# Flutter Print Bridge - Documentación para Desarrolladores

## 📋 Descripción

El **Flutter Print Bridge** es un módulo JavaScript que permite enviar contenido de facturas desde una WebView a Flutter para su formateo e impresión en impresoras POS.

## 🏗️ Arquitectura

```
Web (JavaScript) → Flutter WebView → Impresora POS
     ↓                ↓                ↓
  Contenido      Formateo e        Impresión
  de Factura     Procesamiento     Física
```

## 📁 Archivos

- `flutter-print-bridge.js` - Módulo principal
- `README-FlutterBridge.md` - Esta documentación

## 🚀 Instalación

### 1. Incluir el Script

```html
<!DOCTYPE html>
<html>
<head>
    <title>Impresión de Facturas</title>
</head>
<body>
    <!-- Contenedor para configuración de impresoras -->
    <div id="printersContainer"></div>
    
    <!-- Botón de impresión -->
    <button id="webviewPrintBtn">Imprimir Factura</button>
    
    <!-- Incluir el módulo -->
    <script src="flutter-print-bridge.js"></script>
</body>
</html>
```

### 2. Configurar el Contenido de la Factura

```javascript
// Establecer el contenido de la factura
const facturaContent = `
<center><negrita>FACTURA ELECTRONICA
<center>NIT: 901.185.393-1
<center>Fecha: 2025-01-20
<center>Cliente: Juan Pérez
<center>Total: $50.000
...`;

// Configurar en el módulo
FlutterPrintBridge.setInvoiceContent(facturaContent);
```

## 📖 API Reference

### Configuración de Contenido

#### `setInvoiceContent(content)`
Establece el contenido de la factura.

**Parámetros:**
- `content` (string): Contenido de la factura en formato string

**Ejemplo:**
```javascript
FlutterPrintBridge.setInvoiceContent('<center>Mi factura...</center>');
```

#### `getInvoiceContent()`
Obtiene el contenido de la factura actual.

**Retorna:**
- `string|null`: Contenido de la factura o null si no está establecido

**Ejemplo:**
```javascript
const content = FlutterPrintBridge.getInvoiceContent();
console.log('Contenido:', content);
```

### Gestión de Impresoras

#### `getPrintersConfig()`
Obtiene la configuración actual de impresoras desde la UI.

**Retorna:**
- `Array`: Array de objetos con formato `{ip, copies}`

**Ejemplo:**
```javascript
const printers = FlutterPrintBridge.getPrintersConfig();
console.log('Impresoras:', printers);
// Output: [{ip: "192.168.1.100", copies: 2}, {ip: "192.168.1.101", copies: 1}]
```

#### `addPrinterRow(ip, copies)`
Agrega una nueva fila de configuración de impresora en la UI.

**Parámetros:**
- `ip` (string, opcional): IP de la impresora
- `copies` (number, opcional): Número de copias (default: 1)

**Ejemplo:**
```javascript
FlutterPrintBridge.addPrinterRow('192.168.1.100', 2);
```

### Impresión

#### `printInvoice()`
Función principal para imprimir la factura con la configuración actual.

**Ejemplo:**
```javascript
// Configurar contenido
FlutterPrintBridge.setInvoiceContent('Mi factura...');

// Configurar impresoras en la UI
FlutterPrintBridge.addPrinterRow('192.168.1.100', 2);

// Imprimir
FlutterPrintBridge.printInvoice();
```

#### `sendToFlutter(content, printerIp, copies)`
Envía contenido específico a una impresora específica.

**Parámetros:**
- `content` (string): Contenido a imprimir
- `printerIp` (string): IP de la impresora
- `copies` (number): Número de copias

**Ejemplo:**
```javascript
FlutterPrintBridge.sendToFlutter(
    'Contenido de la factura',
    '192.168.1.100',
    2
);
```

### Utilidades

#### `isFlutterWebView()`
Detecta si la aplicación está ejecutándose en un WebView de Flutter.

**Retorna:**
- `boolean`: true si está en WebView de Flutter

**Ejemplo:**
```javascript
if (FlutterPrintBridge.isFlutterWebView()) {
    console.log('Ejecutando en WebView de Flutter');
}
```

#### `showMessage(text, type)`
Muestra un mensaje de notificación.

**Parámetros:**
- `text` (string): Texto del mensaje
- `type` (string): Tipo de mensaje ('success', 'error', 'info')

**Ejemplo:**
```javascript
FlutterPrintBridge.showMessage('Factura enviada exitosamente', 'success');
```

## 🔧 Uso Completo

### Ejemplo Básico

```javascript
// 1. Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // 2. Configurar el contenido de la factura
    const facturaContent = `
        <center><negrita>FACTURA ELECTRONICA
        <center>NIT: 901.185.393-1
        <center>Fecha: 2025-01-20
        <center>Cliente: Juan Pérez
        <center>Total: $50.000
        <center>****GRACIAS POR SU VISITA****
    `;
    
    FlutterPrintBridge.setInvoiceContent(facturaContent);
    
    // 3. Configurar impresoras
    FlutterPrintBridge.addPrinterRow('192.168.1.100', 2);
    FlutterPrintBridge.addPrinterRow('192.168.1.101', 1);
    
    // 4. El botón ya está configurado automáticamente
    // Al hacer clic en "Imprimir Factura" se enviará a Flutter
});
```

### Ejemplo Avanzado

```javascript
// Configuración dinámica
function configurarImpresion() {
    // Obtener contenido desde una API o variable
    const contenidoFactura = obtenerContenidoFactura();
    
    // Configurar en el módulo
    FlutterPrintBridge.setInvoiceContent(contenidoFactura);
    
    // Configurar múltiples impresoras
    const impresoras = [
        {ip: '192.168.1.100', copies: 2},
        {ip: '192.168.1.101', copies: 1},
        {ip: '192.168.1.102', copies: 3}
    ];
    
    impresoras.forEach(printer => {
        FlutterPrintBridge.addPrinterRow(printer.ip, printer.copies);
    });
    
    // Imprimir automáticamente
    FlutterPrintBridge.printInvoice();
}

// Función auxiliar
function obtenerContenidoFactura() {
    // Aquí puedes obtener el contenido desde donde sea necesario
    return '<center>Contenido de la factura...</center>';
}
```

## 📡 Comunicación con Flutter

### Formato del Mensaje Enviado

```json
{
  "type": "callDirectPrint",
  "data": {
    "content": "contenido de la factura...",
    "printer_ip": "192.168.1.100",
    "nro_copies": 2
  }
}
```

### Función Flutter Esperada

Flutter debe tener una función que reciba este objeto:

```dart
void callDirectPrint({
  required String content,
  required String printer_ip,
  required int nro_copies,
}) {
  // Procesar y formatear el contenido
  // Enviar a la impresora POS
}
```

## 🐛 Debugging

### Logs del Módulo

El módulo genera logs detallados en la consola:

```
[FlutterBridge] Módulo cargado correctamente
[FlutterBridge] Inicializando módulo de impresión...
[FlutterBridge] Botón de impresión configurado
[FlutterBridge] Fila de impresora agregada
[FlutterBridge] Módulo inicializado correctamente
[FlutterBridge] Contenido de factura establecido, longitud: 1500
[FlutterBridge] Configuración de impresoras obtenida: [{ip: "192.168.1.100", copies: 2}]
[FlutterBridge] Enviando a Flutter: {content: "...", printer_ip: "192.168.1.100", nro_copies: 2}
```

### Verificar WebView

```javascript
console.log('¿Es WebView de Flutter?', FlutterPrintBridge.isFlutterWebView());
console.log('¿Existe NativePrinter?', !!window.NativePrinter);
```

### Verificar Configuración

```javascript
console.log('Contenido configurado:', FlutterPrintBridge.getInvoiceContent());
console.log('Impresoras configuradas:', FlutterPrintBridge.getPrintersConfig());
```

## ⚠️ Consideraciones

### 1. Detección de WebView
- El módulo detecta automáticamente WebView de Flutter
- Si la detección falla, usar `window.setFlutterWebView()`

### 2. Fallback a Navegador
- Si no se detecta WebView, imprime en el navegador
- Útil para desarrollo y testing

### 3. Múltiples Impresoras
- Se puede configurar múltiples impresoras
- Cada impresora recibe el mismo contenido

### 4. Formato del Contenido
- El contenido debe ser string
- Flutter se encarga del formateo final

## 🔄 Versiones

- **v1.0.0**: Versión inicial con funcionalidad básica

## 👥 Equipo

- **Desarrollador**: Tu Nombre
- **Fecha**: Enero 2025
- **Proyecto**: Sistema de Impresión de Facturas

---

**Nota**: Este módulo está diseñado para trabajar específicamente con WebView de Flutter y requiere que Flutter implemente la función `callDirectPrint` para recibir y procesar los datos de impresión. 