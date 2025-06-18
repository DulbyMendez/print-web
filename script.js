document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const printBtn = document.getElementById('printBtn');
    const printHistory = document.getElementById('printHistory');

    // Array para almacenar el historial de impresiones
    let printHistoryList = [];

    // Función para imprimir
    function printText() {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Por favor, escribe algo antes de imprimir');
            textInput.focus();
            return;
        }

        // Agregar al historial
        addToHistory(text, 'success');
        
        // Abrir ventana de impresión inmediatamente
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Texto para Imprimir</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 12pt;
                        line-height: 1.5;
                        margin: 2cm;
                        color: #000;
                    }
                    .text-content {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    @media print {
                        body {
                            margin: 1cm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="text-content">${text}</div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Mostrar mensaje de éxito
        showMessage('Texto enviado a impresión exitosamente', 'success');
    }

    // Función para agregar al historial
    function addToHistory(text, status) {
        const timestamp = new Date();
        const historyItem = {
            id: Date.now(),
            text: text,
            status: status,
            timestamp: timestamp
        };
        
        // Agregar al inicio del array
        printHistoryList.unshift(historyItem);
        
        // Limitar a 20 elementos
        if (printHistoryList.length > 20) {
            printHistoryList = printHistoryList.slice(0, 20);
        }
        
        // Guardar en localStorage
        localStorage.setItem('printHistory', JSON.stringify(printHistoryList));
        
        // Actualizar la interfaz
        updateHistoryUI();
    }

    // Función para actualizar la interfaz del historial
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
            
            return `
                <div class="print-item">
                    <div class="print-header">
                        <span class="print-time">${timeString}</span>
                        <span class="print-status ${item.status}">${item.status === 'success' ? 'Exitoso' : 'Error'}</span>
                    </div>
                    <div class="print-content">
                        <strong>Texto impreso:</strong>
                        <div class="print-preview">${previewText}</div>
                    </div>
                </div>
            `;
        }).join('');

        printHistory.innerHTML = historyHTML;
    }

    // Función para mostrar mensajes
    function showMessage(message, type = 'info') {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Agregar al DOM
        document.body.appendChild(messageDiv);
        
        // Mostrar con animación
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }

    // Event listener para el botón de imprimir
    printBtn.addEventListener('click', printText);

    // Event listener para Enter + Ctrl/Cmd para imprimir
    textInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            printText();
        }
    });

    // Auto-resize del textarea
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.max(200, this.scrollHeight) + 'px';
    });

    // Focus automático en el textarea
    textInput.focus();

    // Guardar texto en localStorage
    textInput.addEventListener('input', function() {
        localStorage.setItem('savedText', this.value);
    });

    // Cargar texto guardado
    const savedText = localStorage.getItem('savedText');
    if (savedText) {
        textInput.value = savedText;
    }

    // Cargar historial guardado
    const savedHistory = localStorage.getItem('printHistory');
    if (savedHistory) {
        try {
            printHistoryList = JSON.parse(savedHistory);
            // Convertir timestamps de vuelta a objetos Date
            printHistoryList.forEach(item => {
                item.timestamp = new Date(item.timestamp);
            });
            updateHistoryUI();
        } catch (e) {
            console.error('Error loading print history:', e);
        }
    }

    // Función para limpiar historial (opcional)
    function clearHistory() {
        printHistoryList = [];
        localStorage.removeItem('printHistory');
        updateHistoryUI();
        showMessage('Historial limpiado', 'info');
    }

    // Exponer función para limpiar historial (opcional)
    window.clearPrintHistory = clearHistory;
}); 