// ============================================
//  CONFIGURACIÓN DE SUPABASE
// ============================================
// ⚠️ OJO: Reemplaza estos valores con los de tu proyecto en Supabase
const SUPABASE_URL = 'https://TU_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let selectedFiles = [];
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const shareBtn = document.getElementById('shareBtn');
const statusDiv = document.getElementById('status');

// ============================================
// 📂 LÓGICA PRINCIPAL DE LA APP
// ============================================

fileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    displayFiles();
    shareBtn.disabled = selectedFiles.length === 0;
});

function displayFiles() {
    fileList.innerHTML = selectedFiles.map(file => `
        <div class="file-item">
            <span>📄 ${file.name}</span>
            <span>${formatFileSize(file.size)}</span>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

shareBtn.addEventListener('click', async () => {
    if (!navigator.canShare || !navigator.canShare({ files: selectedFiles })) {
        showStatus(' Tu navegador no soporta compartir archivos', 'error');
        return;
    }

    try {
        showStatus('📤 Abriendo menú de compartir...', 'success');
        
        await navigator.share({
            files: selectedFiles,
            title: 'Archivos compartidos',
            text: 'Te comparto estos archivos'
        });

        await logTransfer('success');
        showStatus('✅ ¡Archivos compartidos exitosamente!', 'success');
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error al compartir:', error);
            await logTransfer('error', error.message);
            showStatus('❌ Error al compartir: ' + error.message, 'error');
        }
    }
});

async function logTransfer(status, errorMessage = null) {
    const transferData = {
        user_id: 'usuario_anonimo',
        files_count: selectedFiles.length,
        files_names: selectedFiles.map(f => f.name),
        total_size: selectedFiles.reduce((acc, f) => acc + f.size, 0),
        status: status,
        error_message: errorMessage,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('transfer_logs')
        .insert([transferData]);

    if (error) {
        console.error('Error al registrar en Supabase:', error);
    }
}

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

// ============================================
// 🔍 LÓGICA DEL BOTÓN FLOTANTE DE CONSOLA
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
    const logEntry = { time: timestamp, message, type };
    debugLogs.push(logEntry);
    updateDebugPanel();
}

function updateDebugPanel() {
    const logsHTML = debugLogs.map(log => {
        const icon = log.type === 'error' ? '❌' : 
                     log.type === 'success' ? '✅' : 
                     log.type === 'warning' ? '️' : 'ℹ️';
        return `<div class="log-line ${log.type}">${icon} [${log.time}] ${log.message}</div>`;
    }).join('');
    
    debugOutput.innerHTML = logsHTML || 'Sin logs aún...';
}

function runDiagnostics() {
    addLog('🔍 Iniciando diagnóstico...', 'info');
    
    if (navigator.share) {
        addLog('✅ Web Share API: DISPONIBLE', 'success');
    } else {
        addLog('❌ Web Share API: NO DISPONIBLE', 'error');
    }
    
    if (navigator.canShare) {
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        if (navigator.canShare({ files: [testFile] })) {
            addLog('✅ Compartir archivos: SOPORTADO', 'success');
        } else {
            addLog('⚠️ Compartir archivos: NO SOPORTADO', 'warning');
        }
    } else {
        addLog('❌ navigator.canShare: NO DISPONIBLE', 'error');
    }
    
    if ('serviceWorker' in navigator) {
        addLog('✅ Service Worker: SOPORTADO', 'success');
    } else {
        addLog('❌ Service Worker: NO SOPORTADO', 'error');
    }
    
    fetch('./manifest.json')
        .then(response => {
            if (response.ok) {
                addLog('✅ manifest.json: CARGADO CORRECTAMENTE', 'success');
                return response.json();
            } else {
                throw new Error('No se pudo cargar');
            }
        })
        .then(manifest => {
            addLog(`📱 Nombre: ${manifest.name}`, 'info');
            addLog(`🎨 Theme color: ${manifest.theme_color}`, 'info');
            addLog(`🖼️ Íconos: ${manifest.icons.length} disponible(s)`, 'info');
        })
        .catch(error => {
            addLog(`❌ manifest.json: ERROR - ${error.message}`, 'error');
        });
    
    addLog(`🌐 Protocolo: ${window.location.protocol}`, 'info');
    
    if (window.location.protocol === 'https:') {
        addLog('✅ HTTPS: ACTIVO', 'success');
    } else {
        addLog('❌ HTTPS: NO ACTIVO', 'error');
    }
}

debugBtn.addEventListener('click', () => {
    debugPanel.classList.toggle('active');
    if (debugPanel.classList.contains('active')) {
        runDiagnostics();
    }
});

closeDebug.addEventListener('click', () => {
    debugPanel.classList.remove('active');
});

copyDebug.addEventListener('click', () => {
    const text = debugLogs.map(log => `[${log.time}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        addLog('📋 Logs copiados al portapapeles', 'success');
    }).catch(() => {
        addLog('❌ No se pudieron copiar los logs', 'error');
    });
});

clearDebug.addEventListener('click', () => {
    debugLogs = [];
    updateDebugPanel();
    addLog('🗑️ Logs limpiados', 'info');
});

window.addEventListener('load', () => {
    setTimeout(runDiagnostics, 1000);
});

// ============================================
// 🔍 CONSOLA FLOTANTE DE DEPURACIÓN
// ============================================

const debugBtn = document.getElementById('debugBtn');
const debugPanel = document.getElementById('debugPanel');
const closeDebug = document.getElementById('closeDebug');
const debugOutput = document.getElementById('debugOutput');
const copyDebug = document.getElementById('copyDebug');
const clearDebug = document.getElementById('clearDebug');

// 📋 Array para guardar todos los logs
let debugLogs = [];

// 📝 Función para agregar un log
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { time: timestamp, message, type };
    debugLogs.push(logEntry);
    updateDebugPanel();
}

// 🔄 Actualizar el panel de depuración
function updateDebugPanel() {
    const logsHTML = debugLogs.map(log => {
        const icon = log.type === 'error' ? '❌' : 
                     log.type === 'success' ? '✅' : 
                     log.type === 'warning' ? '️' : 'ℹ️';
        return `<div class="log-line ${log.type}">${icon} [${log.time}] ${log.message}</div>`;
    }).join('');
    
    debugOutput.innerHTML = logsHTML || 'Sin logs aún...';
}

// 🚀 Ejecutar todas las verificaciones
function runDiagnostics() {
    addLog('🔍 Iniciando diagnóstico...', 'info');
    
    // 1️ Verificar Web Share API
    if (navigator.share) {
        addLog('✅ Web Share API: DISPONIBLE', 'success');
    } else {
        addLog('❌ Web Share API: NO DISPONIBLE en este navegador', 'error');
    }
    
    // 2️⃣ Verificar si puede compartir archivos
    if (navigator.canShare) {
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        if (navigator.canShare({ files: [testFile] })) {
            addLog('✅ Compartir archivos: SOPORTADO', 'success');
        } else {
            addLog('⚠️ Compartir archivos: NO SOPORTADO', 'warning');
        }
    } else {
        addLog('❌ navigator.canShare: NO DISPONIBLE', 'error');
    }
    
    // 3️⃣ Verificar Service Worker
    if ('serviceWorker' in navigator) {
        addLog('✅ Service Worker: SOPORTADO', 'success');
        
        navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length > 0) {
                addLog(`✅ Service Worker registrado: ${registrations.length} activo(s)`, 'success');
            } else {
                addLog('⚠️ Service Worker: No hay ninguno registrado', 'warning');
            }
        });
    } else {
        addLog('❌ Service Worker: NO SOPORTADO', 'error');
    }
    
    // 4️⃣ Verificar manifest.json
    fetch('./manifest.json')
        .then(response => {
            if (response.ok) {
                addLog('✅ manifest.json: CARGADO CORRECTAMENTE', 'success');
                return response.json();
            } else {
                throw new Error('No se pudo cargar');
            }
        })
        .then(manifest => {
            addLog(`📱 Nombre: ${manifest.name}`, 'info');
            addLog(` Theme color: ${manifest.theme_color}`, 'info');
            addLog(`🖼️ Íconos: ${manifest.icons.length} disponible(s)`, 'info');
            
            // Verificar cada ícono
            manifest.icons.forEach(icon => {
                const img = new Image();
                img.onload = () => {
                    addLog(`✅ Ícono ${icon.sizes}: CARGADO`, 'success');
                };
                img.onerror = () => {
                    addLog(`❌ Ícono ${icon.sizes}: NO SE ENCUENTRA`, 'error');
                };
                img.src = icon.src;
            });
        })
        .catch(error => {
            addLog(`❌ manifest.json: ERROR - ${error.message}`, 'error');
        });
    
    // 5️⃣ Información del dispositivo
    addLog(`📱 User Agent: ${navigator.userAgent.substring(0, 50)}...`, 'info');
    addLog(`🌐 Protocolo: ${window.location.protocol}`, 'info');
    addLog(`🔗 URL: ${window.location.href}`, 'info');
    addLog(`📐 Pantalla: ${window.screen.width}x${window.screen.height}`, 'info');
    
    // 6️⃣ Verificar HTTPS
    if (window.location.protocol === 'https:') {
        addLog('✅ HTTPS: ACTIVO (requerido para Web Share API)', 'success');
    } else {
        addLog('❌ HTTPS: NO ACTIVO (Web Share API no funcionará)', 'error');
    }
}

// 🎛️ Event Listeners del botón flotante
debugBtn.addEventListener('click', () => {
    debugPanel.classList.toggle('active');
    if (debugPanel.classList.contains('active')) {
        runDiagnostics();
    }
});

closeDebug.addEventListener('click', () => {
    debugPanel.classList.remove('active');
});

copyDebug.addEventListener('click', () => {
    const text = debugLogs.map(log => `[${log.time}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        addLog('📋 Logs copiados al portapapeles', 'success');
    }).catch(() => {
        addLog('❌ No se pudieron copiar los logs', 'error');
    });
});

clearDebug.addEventListener('click', () => {
    debugLogs = [];
    updateDebugPanel();
    addLog('🗑️ Logs limpiados', 'info');
});

// 🚀 Ejecutar diagnóstico al cargar la página
window.addEventListener('load', () => {
    setTimeout(runDiagnostics, 1000);
});
