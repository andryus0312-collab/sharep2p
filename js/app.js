// ============================================
//  MENSAJE INICIAL - PRUEBA DE CARGA
// ============================================
console.log('✅ app.js se está cargando...');
alert('¡JavaScript cargado correctamente!');

// Esperar a que toda la página cargue
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('✅ DOM listo, inicializando app...');
    
    // ============================================
    // 🔍 BOTÓN FLOTANTE DE CONSOLA
    // ============================================
    
    const debugBtn = document.getElementById('debugBtn');
    const debugPanel = document.getElementById('debugPanel');
    const closeDebug = document.getElementById('closeDebug');
    const debugOutput = document.getElementById('debugOutput');
    const copyDebug = document.getElementById('copyDebug');
    const clearDebug = document.getElementById('clearDebug');
    
    let debugLogs = [];
    
    // Verificar que los elementos existan
    if (!debugBtn) {
        console.error('❌ No se encontró el botón debugBtn');
    } else {
        console.log('✅ debugBtn encontrado');
    }
    
    if (!debugPanel) {
        console.error('❌ No se encontró el panel debugPanel');
    } else {
        console.log('✅ debugPanel encontrado');
    }
    
    function addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        debugLogs.push({ time: timestamp, message, type });
        updateDebugPanel();
    }
    
    function updateDebugPanel() {
        if (!debugOutput) return;
        
        const logsHTML = debugLogs.map(log => {
            const icon = log.type === 'error' ? '❌' : 
                         log.type === 'success' ? '✅' : 
                         log.type === 'warning' ? '️' : '️';
            return `<div class="log-line ${log.type}">${icon} [${log.time}] ${log.message}</div>`;
        }).join('');
        
        debugOutput.innerHTML = logsHTML || 'Sin logs aún...';
    }
    
    function runDiagnostics() {
        debugLogs = [];
        addLog('🔍 Iniciando diagnóstico...', 'info');
        
        if (navigator.share) {
            addLog('✅ Web Share API: DISPONIBLE', 'success');
        } else {
            addLog('❌ Web Share API: NO DISPONIBLE', 'error');
        }
        
        if (window.location.protocol === 'https:') {
            addLog('✅ HTTPS: ACTIVO', 'success');
        } else {
            addLog('❌ HTTPS: NO ACTIVO', 'error');
        }
        
        fetch('./manifest.json')
            .then(response => {
                if (response.ok) {
                    addLog('✅ manifest.json: CARGADO', 'success');
                } else {
                    addLog('❌ manifest.json: ERROR', 'error');
                }
            })
            .catch(() => {
                addLog('❌ manifest.json: NO ENCONTRADO', 'error');
            });
        
        addLog(` URL: ${window.location.href}`, 'info');
    }
    
    // Asignar eventos al botón
    if (debugBtn) {
        debugBtn.addEventListener('click', function() {
            console.log('🔍 Botón debug clickeado');
            debugPanel.classList.add('active');
            runDiagnostics();
        });
    }
    
    if (closeDebug) {
        closeDebug.addEventListener('click', function() {
            debugPanel.classList.remove('active');
        });
    }
    
    if (clearDebug) {
        clearDebug.addEventListener('click', function() {
            debugLogs = [];
            updateDebugPanel();
            addLog('️ Logs limpiados', 'info');
        });
    }
    
    if (copyDebug) {
        copyDebug.addEventListener('click', function() {
            const text = debugLogs.map(log => `[${log.time}] ${log.message}`).join('\n');
            navigator.clipboard.writeText(text).then(() => {
                addLog('📋 Copiado al portapapeles', 'success');
            });
        });
    }
    
    console.log('✅ App inicializada correctamente');
    addLog('✅ App lista para usar', 'success');
});
