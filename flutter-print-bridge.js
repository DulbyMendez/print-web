/**
 * Flutter Print Bridge - Módulo para enviar facturas a Flutter WebView
 * 
 * Este módulo permite enviar contenido de facturas desde una WebView a Flutter
 * para su formateo e impresión en impresoras POS.
 * 
 * @author Marina Mendez
 * @version 1.0.0
 */

(function(window, document) {
    'use strict';

    // --- CONFIGURACIÓN GLOBAL ---
    const CONFIG = {
        HISTORY_KEY: 'printHistory',
        TEXT_KEY: 'savedText',
        MAX_HISTORY: 20
    };

    // --- DETECCIÓN DE WEBVIEW FLUTTER ---
    
    /**
     * Detecta si la aplicación está ejecutándose en un WebView de Flutter
     * @returns {boolean} true si está en WebView de Flutter, false en caso contrario
     */
    function isFlutterWebView() {
        const ua = navigator.userAgent || '';
        return ua.includes('Flutter')
            || !!window.NativePrinter
            || !!window.flutter_inappwebview
            || !!window.flutter_cuenti
            || !!window._isFlutterWebView;
    }

    /**
     * Marca manualmente que estamos en un WebView de Flutter
     * Útil cuando la detección automática no funciona
     */
    window.setFlutterWebView = function() {
        window._isFlutterWebView = true;
        console.log('[FlutterBridge] WebView de Flutter marcado manualmente');
    };

    // --- GESTIÓN DE CONTENIDO DE FACTURA ---
    
    /**
     * Variable que almacena el contenido de la factura
     * @type {string|null}
     */
    let invoiceContent = null;

    /**
     * Establece el contenido de la factura
     * @param {string} content - Contenido de la factura en formato string
     */
    function setInvoiceContent(content) {
        if (typeof content !== 'string') {
            console.error('[FlutterBridge] Error: El contenido debe ser un string');
            return;
        }
        invoiceContent = content;
        console.log('[FlutterBridge] Contenido de factura establecido, longitud:', content.length);
    }

    /**
     * Obtiene el contenido de la factura
     * @returns {string|null} Contenido de la factura o null si no está establecido
     */
    function getInvoiceContent() {
        return invoiceContent;
    }

    // --- GESTIÓN DE CONFIGURACIÓN DE IMPRESORAS ---
    
    /**
     * Obtiene la configuración de impresoras desde la UI
     * @returns {Array} Array de objetos con {ip, copies}
     */
    function getPrintersConfig() {
        const printers = [];
        const printerRows = document.querySelectorAll('.printer-row');
        
        printerRows.forEach(row => {
            const ip = row.querySelector('.printer-ip').value.trim();
            const copies = parseInt(row.querySelector('.printer-copies').value, 10) || 1;
            if (ip) {
                printers.push({ ip, copies });
            }
        });
        
        console.log('[FlutterBridge] Configuración de impresoras obtenida:', printers);
        return printers;
    }

    /**
     * Crea una fila de configuración de impresora en la UI
     * @param {string} ip - IP de la impresora (opcional)
     * @param {number} copies - Número de copias (opcional, default: 1)
     */
    function addPrinterRow(ip = '', copies = 1) {
        const container = document.getElementById('printersContainer');
        if (!container) {
            console.error('[FlutterBridge] Error: No se encontró el contenedor de impresoras');
            return;
        }

        const row = document.createElement('div');
        row.className = 'printer-row';
        row.innerHTML = `
            <input type="text" class="printer-ip" placeholder="IP de impresora" value="${ip}" />
            <input type="number" class="printer-copies" min="1" value="${copies}" />
            <button type="button" class="remove-printer">❌</button>
        `;
        
        row.querySelector('.remove-printer').onclick = () => row.remove();
        container.appendChild(row);
        console.log('[FlutterBridge] Fila de impresora agregada');
    }

    // --- ENVÍO A FLUTTER ---
    
    /**
     * Envía una factura a Flutter para impresión
     * @param {string} content - Contenido de la factura
     * @param {string} printerIp - IP de la impresora
     * @param {number} copies - Número de copias
     */
    function sendToFlutter(content, printerIp, copies) {
        if (!isFlutterWebView()) {
            console.warn('[FlutterBridge] No se detectó WebView de Flutter, usando impresión en navegador');
            printInBrowser(content);
            return;
        }

        const printData = {
            content: content,
            printer_ip: printerIp,
            nro_copies: copies
        };

        console.log('[FlutterBridge] Enviando a Flutter:', printData);
        
        if (window.NativePrinter && window.NativePrinter.postMessage) {
            window.NativePrinter.postMessage(JSON.stringify({
                type: 'callDirectPrint',
                data: printData
            }));
            showMessage(`Factura enviada a ${printerIp} (${copies} copias)`, 'success');
        } else {
            console.error('[FlutterBridge] Error: No se detectó el canal NativePrinter');
            showMessage('Error: No se detectó el canal NativePrinter', 'error');
        }
    }

    /**
     * Función principal para imprimir factura con configuración actual
     */
    function printInvoice() {
        const content = getInvoiceContent();
        if (!content) {
            showMessage('Error: No hay contenido de factura configurado', 'error');
            return;
        }

        const printers = getPrintersConfig();
        if (printers.length === 0) {
            showMessage('Error: No hay impresoras configuradas', 'error');
            return;
        }

        // Enviar a cada impresora configurada
        printers.forEach(printer => {
            sendToFlutter(content, printer.ip, printer.copies);
        });
    }

    // --- IMPRESIÓN EN NAVEGADOR (FALLBACK) ---
    
    /**
     * Imprime contenido en el navegador (fallback cuando no hay WebView)
     * @param {string} content - Contenido a imprimir
     */
    function printInBrowser(content) {
        const originalHTML = document.body.innerHTML;
        document.body.innerHTML = `
            <div style="font-family:Arial,sans-serif; font-size:12pt; line-height:1.5; margin:2cm; white-space:pre-wrap;">
                ${content}
            </div>
        `;
        window.print();
        setTimeout(() => {
            document.body.innerHTML = originalHTML;
            location.reload();
        }, 100);
    }

    // --- UTILIDADES UI ---
    
    /**
     * Muestra un mensaje de notificación
     * @param {string} text - Texto del mensaje
     * @param {string} type - Tipo de mensaje ('success', 'error', 'info')
     */
    function showMessage(text, type = 'info') {
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            ${type === 'success' ? 'background-color: #4CAF50;' : ''}
            ${type === 'error' ? 'background-color: #f44336;' : ''}
            ${type === 'info' ? 'background-color: #2196F3;' : ''}
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.style.opacity = '1', 50);
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }

    /**
     * Inicializa el módulo de impresión
     */
    function init() {
        console.log('[FlutterBridge] Inicializando módulo de impresión...');
        
        // Configurar botón de impresión si existe
        const printBtn = document.getElementById('webviewPrintBtn');
        if (printBtn) {
            printBtn.onclick = printInvoice;
            console.log('[FlutterBridge] Botón de impresión configurado');
        }

        // Agregar al menos una fila de impresora si no existe
        const container = document.getElementById('printersContainer');
        if (container && !container.querySelector('.printer-row')) {
            addPrinterRow();
        }

        console.log('[FlutterBridge] Módulo inicializado correctamente');
    }

    // --- EXPOSICIÓN PÚBLICA ---
    
    // Exponer funciones públicas
    window.FlutterPrintBridge = {
        // Configuración
        setInvoiceContent,
        getInvoiceContent,
        
        // Impresoras
        getPrintersConfig,
        addPrinterRow,
        
        // Impresión
        printInvoice,
        sendToFlutter,
        
        // Utilidades
        isFlutterWebView,
        init,
        showMessage
    };

    // Inicializar automáticamente cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', init);

    console.log('[FlutterBridge] Módulo cargado correctamente');

})(window, document); 