# ��️ Impresor de Texto

Una aplicación web simple y elegante para imprimir texto con un diseño moderno y colores bonitos, incluyendo historial de impresiones.

## ✨ Características

- 📝 Textarea con auto-resize
- 🖨️ Botón de impresión centrado
- 📋 Historial de impresiones en tiempo real
- 🎨 Diseño moderno con gradientes
- 📱 Responsive design
- 💾 Guardado automático del texto e historial
- ⌨️ Atajo de teclado: Ctrl/Cmd + Enter para imprimir
- 🌐 Listo para desplegar en Vercel o Netlify

## 🚀 Despliegue

### Vercel
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio
4. ¡Listo! Se desplegará automáticamente

### Netlify
1. Sube tu código a GitHub
2. Ve a [netlify.com](https://netlify.com)
3. Conecta tu repositorio
4. ¡Listo! Se desplegará automáticamente

## 📁 Estructura del Proyecto

```
print-web/
├── index.html      # Página principal con historial
├── styles.css      # Estilos CSS con diseño moderno
├── script.js       # Funcionalidad JavaScript + historial
├── vercel.json     # Configuración para Vercel
├── netlify.toml    # Configuración para Netlify
└── README.md       # Este archivo
```

## 🎯 Uso

1. **Escribir Texto**: Usar el textarea para escribir el contenido
2. **Imprimir**: Presionar "Imprimir Texto" o Ctrl/Cmd + Enter
3. **Historial**: Ver las impresiones realizadas debajo del botón
4. **Persistencia**: El historial se guarda automáticamente

## 🎨 Tecnologías

- HTML5
- CSS3 (con gradientes y efectos modernos)
- JavaScript (ES6+)
- Google Fonts (Poppins)
- localStorage para persistencia

## 📝 Funcionamiento

1. **Interfaz**: Textarea para escribir y botón de imprimir
2. **Impresión**: Se abre una nueva ventana con el texto formateado
3. **Historial**: Cada impresión se registra con timestamp y preview
4. **Persistencia**: Los datos se guardan en localStorage del navegador

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias (si usas Node.js)
npm install -g serve

# Ejecutar servidor local
serve .

# O usar npx
npx serve .
```

## 📱 Compatibilidad

- ✅ Navegadores modernos
- ✅ Dispositivos móviles
- ✅ Impresión nativa del navegador
- ✅ Historial persistente

## 🔧 Funcionalidades del Historial

- **Registro automático**: Cada impresión se guarda automáticamente
- **Timestamp**: Fecha y hora de cada impresión
- **Preview**: Vista previa del texto impreso (primeros 100 caracteres)
- **Estado**: Indicador de éxito/error
- **Límite**: Máximo 20 impresiones en el historial
- **Persistencia**: Se mantiene entre sesiones

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

# Ejemplo de uso de PrintBridge.callDirectPrint

Para enviar un trabajo de impresión, debes llamar a la función `PrintBridge.callDirectPrint` con los siguientes parámetros:

```js
PrintBridge.callDirectPrint(content, title, printers);
```

Donde:
- `content`: Texto a imprimir (string)
- `title`: Título del trabajo de impresión (string)
- `printers`: Array de impresoras, cada una con su IP y número de copias

## Ejemplo concreto

```js
const content = "Hola mundo\nSegunda línea";
const title = "Impresión de prueba";
const printers = [
  { ip: "192.168.1.100", copies: 2 },
  { ip: "192.168.1.101", copies: 1 }
];

PrintBridge.callDirectPrint(content, title, printers);
```

Esto enviará el siguiente objeto (en formato JSON) al canal de impresión de Flutter si se detecta un WebView:

```json
{
  "content": "Hola mundo\nSegunda línea",
  "title": "Impresión de prueba",
  "printers": [
    { "ip": "192.168.1.100", "copies": 2 },
    { "ip": "192.168.1.101", "copies": 1 }
  ]
}
```

> Todos los strings y mensajes deben estar en español, pero el código debe estar en inglés siguiendo principios de código limpio.
