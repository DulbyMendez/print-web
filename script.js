// --- Detección de WebView de Flutter ---
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
    if (isFlutterWebView()) {
        if (window.NativePrinter && window.NativePrinter.postMessage) {
            window.NativePrinter.postMessage(JSON.stringify({
                content: content,
                title: title,
                printers: printers
            }));
        } else {
            alert("No se detectó el canal NativePrinter de Flutter.");
        }
    } else {
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
}); 