/* // --- Detección de WebView de Flutter ---
function isFlutterWebView() {
    const ua = navigator.userAgent || '';
    if (ua.includes('Flutter')) return true;
    if (window.NativePrinter || window.flutter_inappwebview || window.flutter_cuenti) return true;
    if (window._isFlutterWebView) return true;
    return false;
}
window.setFlutterWebView = function() {
    window._isFlutterWebView = true;
};

// --- Funciones globales para impresión ---
window.printTextareaContent = function() {
    const textarea = document.getElementById('textInput');
    if (textarea) {
        callDirectPrint(textarea.value, "Impresión desde textarea", getPrintersConfig());
    }
};

window.callDirectPrint = function(content, title, printers) {
    console.log('[WEB] Llamando a callDirectPrint:', { content, title, printers });
    if (isFlutterWebView()) {
        console.log('[WEB] Enviando impresión a Flutter WebView vía NativePrinter:', { content, title, printers });
        if (window.NativePrinter && window.NativePrinter.postMessage) {
            window.NativePrinter.postMessage(JSON.stringify({
                content: content,
                title: title,
                printers: printers
            }));
        } else {
            console.warn('[WEB] No se detectó el canal NativePrinter de Flutter.');
        }
    } else {
        console.log('[WEB] Imprimiendo directamente en el navegador:', { content });
        printInBrowser(content);
    }
};

function printInBrowser(content) {
    const originalHTML = document.body.innerHTML;
    document.body.innerHTML = `
        <div class="text-content" style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; margin: 2cm; color: #000; white-space: pre-wrap; word-wrap: break-word;">
            ${content}
        </div>
    `;
    window.print();
    setTimeout(() => {
        document.body.innerHTML = originalHTML;
        location.reload();
    }, 100);
}

// --- Inputs dinámicos para impresoras ---
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
    return printers;
}

function addPrinterRow(ip = '', copies = 1) {
    const printersContainer = document.getElementById('printersContainer');
    const row = document.createElement('div');
    row.className = 'printer-row';
    row.innerHTML = `
        <input type="text" class="printer-ip" placeholder="IP de impresora" value="${ip}" style="width: 160px; margin-right: 8px;" />
        <input type="number" class="printer-copies" placeholder="Copias" min="1" value="${copies}" style="width: 70px; margin-right: 8px;" />
        <button type="button" class="remove-printer" title="Quitar impresora">❌</button>
    `;
    row.querySelector('.remove-printer').onclick = function() {
        row.remove();
    };
    printersContainer.appendChild(row);
}

function setupPrintersUI() {
    const addBtn = document.getElementById('addPrinterBtn');
    addBtn.onclick = function() {
        addPrinterRow();
    };
    // Al menos una impresora por defecto
    if (document.querySelectorAll('.printer-row').length === 0) {
        addPrinterRow();
    }
}

// --- Historial e impresión ---
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const printBtn = document.getElementById('printBtn');
    const printHistory = document.getElementById('printHistory');
    let printHistoryList = [];

    setupPrintersUI();

    function printText() {
        const text = textInput.value.trim();
        if (!text) {
            alert('Por favor, escribe algo antes de imprimir');
            textInput.focus();
            return;
        }
        const printers = getPrintersConfig();
        addToHistory(text, 'success', printers);
        // Llama a Flutter o imprime en navegador
        window.callDirectPrint(text, "Impresión desde textarea", printers);
        showMessage('Texto enviado a impresión exitosamente', 'success');
    }

    function addToHistory(text, status, printers) {
        const timestamp = new Date();
        const historyItem = {
            id: Date.now(),
            text: text,
            status: status,
            timestamp: timestamp,
            printers: printers || []
        };
        printHistoryList.unshift(historyItem);
        if (printHistoryList.length > 20) {
            printHistoryList = printHistoryList.slice(0, 20);
        }
        localStorage.setItem('printHistory', JSON.stringify(printHistoryList));
        updateHistoryUI();
    }

    function updateHistoryUI() {
        if (printHistoryList.length === 0) {
            printHistory.innerHTML = '<p class="empty-message">No hay impresiones registradas</p>';
            return;
        }
        const historyHTML = printHistoryList.map(item => {
            const timeString = item.timestamp.toLocaleString();
            const previewText = item.text.length > 100 
                ? item.text.substring(0, 100) + '...' 
                : item.text;
            const printersInfo = item.printers && item.printers.length > 0
                ? `<div class='print-printers'><strong>Impresoras:</strong> ${item.printers.map(p => `${p.ip} (${p.copies} copias)`).join(', ')}</div>`
                : '';
            return `
                <div class="print-item">
                    <div class="print-header">
                        <span class="print-time">${timeString}</span>
                        <span class="print-status ${item.status}">${item.status === 'success' ? 'Exitoso' : 'Error'}</span>
                    </div>
                    <div class="print-content">
                        <strong>Texto impreso:</strong>
                        <div class="print-preview">${previewText}</div>
                        ${printersInfo}
                    </div>
                </div>
            `;
        }).join('');
        printHistory.innerHTML = historyHTML;
    }

    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 100);
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }

    printBtn.addEventListener('click', printText);
    textInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            printText();
        }
    });
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.max(200, this.scrollHeight) + 'px';
    });
    textInput.focus();
    textInput.addEventListener('input', function() {
        localStorage.setItem('savedText', this.value);
    });
    const savedText = localStorage.getItem('savedText');
    if (savedText) {
        textInput.value = savedText;
    }
    const savedHistory = localStorage.getItem('printHistory');
    if (savedHistory) {
        try {
            printHistoryList = JSON.parse(savedHistory);
            printHistoryList.forEach(item => {
                item.timestamp = new Date(item.timestamp);
            });
            updateHistoryUI();
        } catch (e) {
            console.error('Error loading print history:', e);
        }
    }
    function clearHistory() {
        printHistoryList = [];
        localStorage.removeItem('printHistory');
        updateHistoryUI();
        showMessage('Historial limpiado', 'info');
    }
    window.clearPrintHistory = clearHistory;
});  */

(function(window, document) {
    'use strict';
  
    // --- Módulo NativePrinter/WebPrint encapsulado ---
    const PrintBridge = (function() {
      function isFlutterWebView() {
        const ua = navigator.userAgent || '';
        return ua.includes('Flutter')
          || !!window.NativePrinter
          || !!window.flutter_inappwebview
          || !!window.flutter_cuenti
          || !!window._isFlutterWebView;
      }
      function callDirectPrint(content, title, printers) {
        console.log('[PrintBridge] callDirectPrint:', { content, title, printers });
        if (isFlutterWebView()) {
          try {
            const payload = { content, title, printers };
            const message = JSON.stringify(payload);
            window.NativePrinter.postMessage(message);
            console.log('[PrintBridge] Mensaje enviado a NativePrinter');
          } catch (err) {
            console.error('[PrintBridge] Error enviando mensaje:', err);
          }
        } else {
          BrowserPrinter.print(content);
        }
      }
      return { callDirectPrint, isFlutterWebView };
    })();
  
    // --- Módulo impresión en navegador ---
    const BrowserPrinter = (function() {
      function print(content) {
        const originalHTML = document.body.innerHTML;
        document.body.innerHTML = `
          <div style="font-family:Arial,sans-serif; font-size:12pt; line-height:1.5; margin:2cm; white-space:pre-wrap;">${content}</div>
        `;
        window.print();
        setTimeout(() => {
          document.body.innerHTML = originalHTML;
          location.reload();
        }, 100);
      }
      return { print };
    })();
  
    // --- Módulo UI: gestión de impresoras, textarea e historial ---
    const PrintUI = (function() {
      const historyKey = 'printHistory';
      const textKey = 'savedText';
      let historyList = [];
  
      function init() {
        setupPrinterInputs();
        loadText();
        loadHistory();
        bindEvents();
      }
  
      function setupPrinterInputs() {
        const container = document.getElementById('printersContainer');
        document.getElementById('addPrinterBtn').onclick = () => addPrinterRow('', 1);
        if (!container.querySelector('.printer-row')) {
          addPrinterRow('', 1);
        }
      }
  
      function addPrinterRow(ip = '', copies = 1) {
        const container = document.getElementById('printersContainer');
        const row = document.createElement('div');
        row.className = 'printer-row';
        row.innerHTML = `
          <input type="text" class="printer-ip" placeholder="IP de impresora" value="${ip}" />
          <input type="number" class="printer-copies" min="1" value="${copies}" />
          <button type="button" class="remove-printer">❌</button>
        `;
        row.querySelector('.remove-printer').onclick = () => row.remove();
        container.appendChild(row);
      }
  
      function getPrintersConfig() {
        return Array.from(document.querySelectorAll('.printer-row'))
          .map(row => {
            const ip = row.querySelector('.printer-ip').value.trim();
            const copies = parseInt(row.querySelector('.printer-copies').value, 10) || 1;
            return ip ? { ip, copies } : null;
          })
          .filter(p => p);
      }
  
      function bindEvents() {
        const textInput = document.getElementById('textInput');
        const printBtn = document.getElementById('printBtn');
        const webviewPrintBtn = document.getElementById('webviewPrintBtn');
        
        printBtn.onclick = handlePrint;
        webviewPrintBtn.onclick = handleWebViewPrint;
        
        textInput.onkeydown = e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handlePrint();
          }
        };
        textInput.oninput = () => {
          textInput.style.height = 'auto';
          textInput.style.height = Math.max(200, textInput.scrollHeight) + 'px';
          localStorage.setItem(textKey, textInput.value);
        };
        window.clearPrintHistory = clearHistory;
        
        // Mostrar/ocultar botón de WebView según el entorno
        updateWebViewButtonVisibility();
      }
      
      function updateWebViewButtonVisibility() {
        const webviewPrintBtn = document.getElementById('webviewPrintBtn');
        if (webviewPrintBtn) {
          if (PrintBridge.isFlutterWebView()) {
            webviewPrintBtn.style.display = 'flex';
            console.log('[WEB] Botón de WebView mostrado - detectado Flutter WebView');
          } else {
            webviewPrintBtn.style.display = 'none';
            console.log('[WEB] Botón de WebView oculto - navegador normal');
          }
        }
      }
      
      function handleWebViewPrint() {
        // Cargar el contenido de content.txt
        fetch('content.txt')
          .then(response => {
            if (!response.ok) {
              throw new Error('No se pudo cargar el contenido');
            }
            return response.text();
          })
          .then(content => {
            // Formatear saltos de línea para Flutter
            const formattedContent = content.replace(/\n/g, '\\n');
            
            // Obtener configuración de impresoras
            const printers = getPrintersConfig();
            
            if (printers.length === 0) {
              alert('Por favor, configura al menos una impresora con IP y número de copias');
              return;
            }
            
            // Tomar la primera impresora configurada
            const printer = printers[0];
            const ip = printer.ip;
            const copies = printer.copies;
            
            addToHistory(content, 'webview', printers);
            
            // Enviar a Flutter con IP, contenido formateado y copias
            console.log('[WEB] Enviando a Flutter:', { ip, copies, contentLength: formattedContent.length });
            if (window.NativePrinter && window.NativePrinter.postMessage) {
              window.NativePrinter.postMessage(JSON.stringify({
                type: 'printToPrinter',
                ip: ip,
                content: formattedContent,
                copies: copies
              }));
              showMessage(`Factura enviada a impresora ${ip} (${copies} copias)`, 'success');
            } else {
              showMessage('Error: No se detectó el canal NativePrinter', 'error');
            }
          })
          .catch(error => {
            console.error('Error cargando content.txt:', error);
            showMessage('Error al cargar el contenido de la factura', 'error');
          });
      }
  
      function handlePrint() {
        const content = document.getElementById('textInput').value.trim();
        if (!content) {
          alert('Por favor, escribe algo para imprimir');
          document.getElementById('textInput').focus();
          return;
        }
        const printers = getPrintersConfig();
        addToHistory(content, 'success', printers);
        
        // Verificar si hay imagen base64 para procesar en Flutter
        const hasImage = content.includes('<imagen_grande>');
        
        if (hasImage && PrintBridge.isFlutterWebView()) {
          // Enviar a Flutter para procesamiento de imagen
          console.log('[WEB] Detectada imagen base64, enviando a Flutter para procesamiento');
          if (window.NativePrinter && window.NativePrinter.postMessage) {
            window.NativePrinter.postMessage(JSON.stringify({
              type: 'processInvoiceWithImage',
              content: content,
              title: 'Impresión Manual con Imagen',
              printers: printers
            }));
            showMessage('Contenido con imagen enviado a Flutter para procesamiento', 'success');
          }
        } else {
          // Enviar a impresión normal
          PrintBridge.callDirectPrint(content, 'Impresión desde textarea', printers);
          showMessage('Texto enviado a impresión', 'success');
        }
      }
  
      function addToHistory(text, status, printers) {
        const item = { id: Date.now(), text, status, printers, timestamp: new Date() };
        historyList.unshift(item);
        if (historyList.length > 20) historyList.pop();
        localStorage.setItem(historyKey, JSON.stringify(historyList));
        renderHistory();
      }
  
      function loadHistory() {
        try {
          historyList = JSON.parse(localStorage.getItem(historyKey)) || [];
          historyList.forEach(i => i.timestamp = new Date(i.timestamp));
        } catch {
          historyList = [];
        }
        renderHistory();
      }
  
      function loadText() {
        const saved = localStorage.getItem(textKey);
        if (saved) document.getElementById('textInput').value = saved;
      }
  
      function renderHistory() {
        const container = document.getElementById('printHistory');
        if (!historyList.length) {
          container.innerHTML = '<p>No hay historial de impresión</p>';
          return;
        }
        container.innerHTML = historyList.map(i => {
          const time = i.timestamp.toLocaleString();
          const preview = i.text.length > 100 ? i.text.substr(0,100) + '...' : i.text;
          const printers = (i.printers || []).map(p => `${p.ip} (${p.copies})`).join(', ');
          
          // Determinar el estado mostrado
          let statusText = 'Exitoso';
          let statusClass = 'success';
          if (i.status === 'webview') {
            statusText = 'WebView';
            statusClass = 'webview';
          } else if (i.status === 'error') {
            statusText = 'Error';
            statusClass = 'error';
          }
          
          return `
            <div class="history-item">
              <div><strong>${time}</strong> — <span class="status-${statusClass}">${statusText}</span></div>
              <div>${preview} <em>${printers}</em></div>
            </div>`;
        }).join('');
      }
  
      function clearHistory() {
        historyList = [];
        localStorage.removeItem(historyKey);
        renderHistory();
        showMessage('Historial borrado', 'info');
      }
  
      function showMessage(text, type='info') {
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
  
      return { init };
    })();
  
    // Inicialización al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
      PrintUI.init();
      window.setFlutterWebView(); // marcar manualmente si necesario
      
      // Cargar y enviar el contenido de la factura automáticamente
      loadAndPrintInvoice();
    });
  
    // Función para cargar y enviar la factura automáticamente
    async function loadAndPrintInvoice() {
      try {
        const response = await fetch('content.txt');
        if (response.ok) {
          const invoiceContent = await response.text();
          
          // Colocar el contenido en el textarea
          const textInput = document.getElementById('textInput');
          if (textInput) {
            textInput.value = invoiceContent;
            textInput.style.height = 'auto';
            textInput.style.height = Math.max(200, textInput.scrollHeight) + 'px';
          }
          
          // Guardar en localStorage
          localStorage.setItem('savedText', invoiceContent);
          
          // Verificar si hay imagen base64 para procesar en Flutter
          const hasImage = invoiceContent.includes('<imagen_grande>');
          
          if (hasImage && PrintBridge.isFlutterWebView()) {
            // Enviar a Flutter para procesamiento de imagen
            console.log('[WEB] Detectada imagen base64, enviando a Flutter para procesamiento');
            if (window.NativePrinter && window.NativePrinter.postMessage) {
              window.NativePrinter.postMessage(JSON.stringify({
                type: 'processInvoiceWithImage',
                content: invoiceContent,
                title: 'Factura Electrónica con Imagen',
                printers: []
              }));
              showMessage('Factura con imagen enviada a Flutter para procesamiento', 'success');
            }
          } else {
            // Enviar a impresión normal (sin imagen o en navegador)
            setTimeout(() => {
              PrintBridge.callDirectPrint(invoiceContent, 'Factura Electrónica', []);
              showMessage('Factura enviada a impresión automáticamente', 'success');
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error cargando la factura:', error);
        showMessage('Error al cargar la factura', 'error');
      }
    }
  })(window, document);
  