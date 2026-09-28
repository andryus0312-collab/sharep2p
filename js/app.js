// Esperar a que la página cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
// 🗄️ SUPABASE CONFIGURACIÓN
// ============================================
const SUPABASE_URL = 'https://lvfkjdccpaesmjvsiyv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2pnzPAe1qWgEpKzCnT6uA_BcFBojtL';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para detectar tipo de dispositivo
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
}

// Función para registrar transferencia en Supabase
async function registerTransfer(fileName, fileSize, fileType, shareMethod) {
    try {
        const { data, error } = await supabase
            .from('transferencias')
            .insert([
                {
                    file_name: fileName,
                    file_size: fileSize,
                    file_type: fileType,
                    device_type: getDeviceType(),
                    share_method: shareMethod,
                    user_agent: navigator.userAgent
                }
            ]);
        
        if (error) {
            console.error('❌ Error al registrar transferencia:', error);
        } else {
            console.log('✅ Transferencia registrada en Supabase');
        }
    } catch (err) {
        console.error('❌ Error inesperado al registrar:', err);
    }
}
    console.log('✅ DOM Cargado - App iniciada');

    // 1️⃣ Identificar los elementos del HTML
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const shareBtn = document.getElementById('shareBtn');
    const statusDiv = document.getElementById('status');
    const debugBtn = document.getElementById('debugBtn');
    const debugPanel = document.getElementById('debugPanel');
    const previewContainer = document.getElementById('previewContainer');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const themeToggle = document.getElementById('themeToggle');
    
    // Elementos del QR
    const qrBtn = document.getElementById('qrBtn');
    const qrModal = document.getElementById('qrModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrLinkInput = document.getElementById('qrLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    let selectedFiles = [];

    // ============================================
    // 🌙 MODO OSCURO
    // ============================================
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ============================================
    // 📂 SELECCIÓN DE ARCHIVOS
    // ============================================
    fileInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length > 0) {
            fileList.innerHTML = selectedFiles.map(file => `
                <div class="file-item">
                    <span>📄 ${file.name}</span>
                    <span>${formatFileSize(file.size)}</span>
                </div>
            `).join('');

            generatePreviews(selectedFiles);

            shareBtn.disabled = false;
            shareBtn.classList.add('active');
            
            // Detectar si puede compartir (Móvil) o debe descargar (PC)
            const canShare = navigator.canShare && navigator.canShare({ files: selectedFiles });
            const actionText = canShare ? 'Compartir' : 'Descargar';
            shareBtn.querySelector('.btn-text').textContent = `${actionText} (${selectedFiles.length})`;
            
        } else {
            resetApp();
        }
    });

    function generatePreviews(files) {
        previewContainer.innerHTML = '';
        files.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.style.animationDelay = `${index * 0.1}s`;

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewItem.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                const icon = document.createElement('div');
                icon.className = 'file-icon';
                if (file.type.startsWith('video/')) icon.textContent = '🎬';
                else if (file.type.includes('pdf')) icon.textContent = '📕';
                else if (file.type.includes('word') || file.type.includes('document')) icon.textContent = '📝';
                else icon.textContent = '📄';
                previewItem.appendChild(icon);
            }
            previewContainer.appendChild(previewItem);
        });
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // ============================================
// 🚀 COMPARTIR O DESCARGAR ARCHIVOS (Compatible PC y Móvil)
// ============================================
shareBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    const canShareFiles = navigator.canShare && navigator.canShare({ files: selectedFiles });

    try {
        showProgress(20, '⏳ Preparando archivos...');

        const signatureMessage = selectedFiles.map(file => {
            return `🎉✨ *ARCHIVO COMPARTIDO* 📤✨\n📄 Nombre: ${file.name}\n📦 Tamaño: ${formatFileSize(file.size)}\n━━━━━━━━━━━━━━━━━━━━━━━\n📱 Compartido a través de:\n🚀 ShareP2P - Tu app de compartir archivos\n🔗 Visita la app:\nhttps://andryus0312-collab.github.io/sharep2p/\n━━━━━━━━━━━━━━━━━━━━━━━\n💙 Hecho con 💙 por Sr. Andryus 💙\n¡Gracias por usar ShareP2P! 🌟`;
        }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━\n\n');

        if (canShareFiles) {
            // 📱 MODO MÓVIL: Usar API nativa
            showProgress(50, '📤 Abriendo menú de compartir...');
            await navigator.share({
                files: selectedFiles,
                title: '📤 Archivos compartidos con ShareP2P',
                text: signatureMessage
            });
            
            showProgress(100, '✅ ¡Compartido con éxito!');
            
            // Registrar cada archivo compartido
            for (const file of selectedFiles) {
                await registerTransfer(file.name, file.size, file.type, 'web_share');
            }

        } else {
            // 💻 MODO PC: Descargar archivos directamente
            showProgress(50, '💻 Descargando archivos a tu computadora...');
            
            for (const file of selectedFiles) {
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Registrar descarga
                await registerTransfer(file.name, file.size, file.type, 'download');
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            showProgress(100, '✅ ¡Archivos descargados!');
        }

        setTimeout(() => {
            hideProgress();
            resetApp();
        }, 2500);

    } catch (err) {
        if (err.name !== 'AbortError') {
            showProgress(0, '❌ Error: ' + err.message, true);
            setTimeout(() => {
                hideProgress();
            }, 3000);
        } else {
            showProgress(0, '⚠️ Acción cancelada');
            setTimeout(() => {
                hideProgress();
            }, 2000);
        }
    }
});

    function showProgress(percent, message, isError = false) {
        progressBar.classList.add('active');
        progressFill.style.width = percent + '%';
        progressText.textContent = message;
        progressFill.style.background = isError ? '#ef4444' : '';
    }

    function hideProgress() {
        progressBar.classList.remove('active');
        progressFill.style.width = '0%';
    }

    // ============================================
    // 📱 GENERAR CÓDIGO QR
    // ============================================
    qrBtn.addEventListener('click', () => {
        qrcodeContainer.innerHTML = '';
        const qrMessage = `¡Hola! Te invito a usar ShareP2P.\n🔗 https://andryus0312-collab.github.io/sharep2p/`;
        qrLinkInput.value = 'https://andryus0312-collab.github.io/sharep2p/';

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrMessage)}&color=667eea`;
        const qrImage = document.createElement('img');
        qrImage.src = qrUrl;
        qrImage.style.width = '200px';
        qrImage.style.height = '200px';
        qrcodeContainer.appendChild(qrImage);

        setTimeout(() => qrModal.classList.add('active'), 100);
    });

    closeQrModal.addEventListener('click', () => qrModal.classList.remove('active'));
    qrModal.addEventListener('click', (e) => { if (e.target === qrModal) qrModal.classList.remove('active'); });

    copyLinkBtn.addEventListener('click', () => {
        qrLinkInput.select();
        navigator.clipboard.writeText(qrLinkInput.value).catch(() => document.execCommand('copy'));
        copyLinkBtn.textContent = '✅ Copiado';
        setTimeout(() => copyLinkBtn.textContent = '📋 Copiar enlace', 2000);
    });

    // ============================================
    // 🔍 CONSOLA DE DEPURACIÓN
    // ============================================
    let logs = [];
    const addLog = (msg, type = 'info') => {
        logs.push({ msg, type, time: new Date().toLocaleTimeString() });
        document.getElementById('debugOutput').innerHTML = logs.map(l => 
            `<div class="log-line ${l.type}">[${l.time}] ${l.msg}</div>`
        ).join('');
    };

    debugBtn.addEventListener('click', () => {
        debugPanel.classList.add('active');
        logs = [];
        addLog('🔍 Diagnóstico iniciado', 'info');
        
        const canShareFiles = navigator.canShare && navigator.canShare({ files: [new File([''], 'test.txt')] });
        addLog(canShareFiles ? '✅ Web Share API: OK' : '⚠️ Modo Descarga (PC) activado', canShareFiles ? 'success' : 'info');
        addLog(window.location.protocol === 'https:' ? '✅ HTTPS: OK' : '⚠️ HTTPS: Falta', window.location.protocol === 'https:' ? 'success' : 'error');
        addLog('✅ Service Worker: ' + ('serviceWorker' in navigator ? 'Soportado' : 'No soportado'), 'success');
    });

    document.getElementById('closeDebug').addEventListener('click', () => debugPanel.classList.remove('active'));
    document.getElementById('clearDebug').addEventListener('click', () => { 
        logs = []; document.getElementById('debugOutput').innerHTML = ''; 
    });

    function resetApp() {
        selectedFiles = [];
        previewContainer.innerHTML = '';
        fileList.innerHTML = '';
        fileInput.value = '';
        shareBtn.disabled = true;
        shareBtn.classList.remove('active');
        shareBtn.querySelector('.btn-text').textContent = 'Compartir';
    }

    // ============================================
    // ⚡ REGISTRAR SERVICE WORKER (MODO OFFLINE)
    // ============================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Apunta a la raíz donde creaste el sw.js
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('✅ Service Worker registrado'))
                .catch((err) => console.error('❌ Error SW:', err));
        });
    }
});
