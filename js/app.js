// ============================================
// 🔧 CONFIGURACIÓN DE SUPABASE (Vacía por ahora)
// ============================================
// ⚠️ OJO: Cuando configures Supabase, pega tus claves aquí.
const SUPABASE_URL = 'https://TU_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI';

// Intentamos crear el cliente, pero si no hay claves, no falla la app
let supabase = null;
if (typeof window.supabase !== 'undefined') {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.log('️ Supabase no configurado aún, la app funcionará sin guardar registros.');
    }
}

// ============================================
//  LÓGICA PRINCIPAL DE LA APP
// ============================================

// Esperar a que la página cargue
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos de la app
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const shareBtn = document.getElementById('shareBtn');
    const statusDiv = document.getElementById('status');
    
    let selectedFiles = [];

    // 📂 Cuando el usuario elige archivos
    fileInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        displayFiles();
        
        // Habilitar el botón de compartir si hay archivos
        if (selectedFiles.length > 0) {
            shareBtn.disabled = false;
            shareBtn.style.background = '#10b981'; // Color verde
            shareBtn.style.color = 'white';
        } else {
            shareBtn.disabled = true;
            shareBtn.style.background = '#ccc'; // Color gris
        }
    });

    // 📋 Mostrar la lista de archivos en pantalla
    function displayFiles() {
        fileList.innerHTML = selectedFiles.map(file => `
            <div class="file-item">
                <span>📄 ${file.name}</span>
                <span>${formatFileSize(file.size)}</span>
            </div>
        `).join('');
    }

    // 📏 Formatear el tamaño (KB, MB)
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // 🚀 Botón de Compartir
    shareBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        // Verificar si el navegador soporta compartir archivos
        if (!navigator.canShare || !navigator.canShare({ files: selectedFiles })) {
            showStatus('❌ Tu navegador no soporta compartir archivos', 'error');
            return;
        }

        try {
            showStatus('📤 Abriendo menú de compartir...', 'success');
            
            // Abrir el menú nativo de Android
            await navigator.share({
                files: selectedFiles,
                title: 'Archivos compartidos desde ShareP2P',
                text: 'Te comparto estos archivos'
            });

            showStatus('✅ ¡Compartido exitosamente!', 'success');
            
            // Aquí iría el código para guardar en Supabase cuando lo configuremos
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error al compartir:', error);
                showStatus('❌ Error: ' + error.message, 'error');
            } else {
                showStatus('️ Compartición cancelada', 'warning');
            }
        }
    });

    // 💬 Mostrar mensajes de estado
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    // ============================================
    // 🔍 LÓGICA DE LA CONSOLA FLOTANTE (LUPA)
    // ============================================
    
    const debugBtn = document.getElementById('debugBtn');
    const debugPanel = document.getElementById('debugPanel');
    const closeDebug = document.getElementById('closeDebug');
    const debugOutput = document.getElementById('debugOutput');
    const copyDebug = document.getElementById('copyDebug');
    const clearDebug = document.getElementById('clearDebug');
    
    let debugLogs = [];
    
    function addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        debugLogs.push({ time: timestamp, message, type });
        updateDebugPanel();
    }
    
    function updateDebugPanel() {
        if (!debugOutput) return;
        const logsHTML = debugLogs.map(log => {
            const icon = log.type === 'error' ? '' : 
                         log.type === 'success' ? '✅' : 
                         log.type === 'warning' ? '️' : '️';
            return `<div class="log-line ${log.type}">${icon} [${log.time}] ${log.message}</div>`;
        }).join('');
        debugOutput.innerHTML = logsHTML || 'Sin logs aún...';
    }
    
    function runDiagnostics() {
        debugLogs = [];
        addLog(' Iniciando diagnóstico...', 'info');
        
        if (navigator.share) addLog('✅ Web Share API: DISPONIBLE', 'success');
        else addLog('❌ Web Share API: NO DISPONIBLE', 'error');
        
        if (window.location.protocol === 'https:') addLog('✅ HTTPS: ACTIVO', 'success');
        else addLog('❌ HTTPS: NO ACTIVO', 'error');
        
        addLog(`🔗 URL: ${window.location.href}`, 'info');
    }
    
    if (debugBtn) {
        debugBtn.addEventListener('click', () => {
            debugPanel.classList.add('active');
            runDiagnostics();
        });
    }
    
    if (closeDebug) closeDebug.addEventListener('click', () => debugPanel.classList.remove('active'));
    if (clearDebug) clearDebug.addEventListener('click', () => { debugLogs = []; updateDebugPanel(); });
    if (copyDebug) {
        copyDebug.addEventListener('click', () => {
            const text = debugLogs.map(log => `[${log.time}] ${log.message}`).join('\n');
            navigator.clipboard.writeText(text).then(() => addLog('📋 Copiado', 'success'));
        });
    }
    
    console.log('✅ App ShareP2P inicializada correctamente');
});
