// Esperar a que la página cargue completamente
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Cargar preferencia guardada
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
        console.log('🎨 Tema cambiado a:', isDark ? 'oscuro' : 'claro');
    });

    // ============================================
    // 📂 SELECCIÓN DE ARCHIVOS
    // ============================================
    
    fileInput.addEventListener('change', (e) => {
        console.log('📂 Archivos detectados:', e.target.files.length);
        selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles.length > 0) {
            // Mostrar lista de archivos
            fileList.innerHTML = selectedFiles.map(file => `
                <div class="file-item">
                    <span> ${file.name}</span>
                    <span>${formatFileSize(file.size)}</span>
                </div>
            `).join('');
            
            //  Generar vista previa
            generatePreviews(selectedFiles);
            
            // Activar botón de compartir
            shareBtn.disabled = false;
            shareBtn.classList.add('active');
            shareBtn.querySelector('.btn-text').textContent = `Compartir (${selectedFiles.length})`;
        } else {
            fileList.innerHTML = '';
            previewContainer.innerHTML = '';
            shareBtn.disabled = true;
            shareBtn.classList.remove('active');
            shareBtn.querySelector('.btn-text').textContent = 'Compartir';
        }
    });

    // 🆕 Generar vista previa de archivos
    function generatePreviews(files) {
        previewContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.style.animationDelay = `${index * 0.1}s`;
            
            if (file.type.startsWith('image/')) {
                // Es una imagen: mostrar thumbnail
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    previewItem.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                // No es imagen: mostrar ícono según tipo
                const icon = document.createElement('div');
                icon.className = 'file-icon';
                
                if (file.type.startsWith('video/')) {
                    icon.textContent = '🎬';
                } else if (file.type.includes('pdf')) {
                    icon.textContent = '📕';
                } else if (file.type.includes('word') || file.type.includes('document')) {
                    icon.textContent = '📝';
                } else {
                    icon.textContent = '📄';
                }
                
                previewItem.appendChild(icon);
            }
            
            previewContainer.appendChild(previewItem);
        });
    }

    //  Formatear tamaño de archivo
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // ============================================
    // 🚀 COMPARTIR ARCHIVOS
    // ============================================
    
    shareBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;
        
        try {
            // 🆕 Mostrar barra de progreso - Fase 1
            showProgress(20, '⏳ Preparando archivos...');
            
            // Crear mensaje de firma
            const signatureMessage = selectedFiles.map(file => {
                return `🎉✨ *ARCHIVO COMPARTIDO* 📤✨

📄 *Nombre:* ${file.name}
📦 *Tamaño:* ${formatFileSize(file.size)}

━━━━━━━━━━━━━━━━━━━━━━━
📱 *Compartido a través de:*
🚀 *ShareP2P* - Tu app de compartir archivos

🔗 *Visita la app:*
 https://andryus0312-collab.github.io/sharep2p/
━━━━━━━━━━━━━━━━━━━━━━━

💙 *Hecho con  por Sr. Andryus* 💙
 ¡Gracias por usar ShareP2P! 🌟`;
            }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━\n\n');
            
            // 🆕 Fase 2
            showProgress(50, '📤 Abriendo menú de compartir...');
            
            // Llamar a la API nativa
            await navigator.share({
                files: selectedFiles,
                title: '📤 Archivos compartidos con ShareP2P',
                text: signatureMessage
            });
            
            //  Fase 3 - Éxito
showProgress(100, '✅ ¡Compartido con éxito!');

// 🆕 Limpiar todo después de 2.5 segundos
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
                showProgress(0, '⚠️ Compartición cancelada');
                setTimeout(() => {
                    hideProgress();
                }, 2000);
            }
        }
    });

    // 🆕 Funciones de barra de progreso
    function showProgress(percent, message, isError = false) {
        progressBar.classList.add('active');
        progressFill.style.width = percent + '%';
        progressText.textContent = message;
        
        if (percent > 0 && percent < 100) {
            progressFill.classList.add('animating');
        } else {
            progressFill.classList.remove('animating');
        }
        
        if (isError) {
            progressFill.style.background = '#ef4444';
        } else {
            progressFill.style.background = '';
        }
    }
    
    function hideProgress() {
        progressBar.classList.remove('active');
        progressFill.style.width = '0%';
        progressFill.style.background = '';
        progressFill.classList.remove('animating');
    }

    // ============================================
    //  GENERAR CÓDIGO QR
    // ============================================
    
    qrBtn.addEventListener('click', () => {
        console.log('📱 Generando código QR...');
        
        qrcodeContainer.innerHTML = '';
        
        const qrMessage = `¡Hola! Te invito a usar ShareP2P para compartir archivos de forma rápida y segura.

🔗 https://andryus0312-collab.github.io/sharep2p/

💙 Hecho con 🩵 por Sr. Andryus`;
        
        qrLinkInput.value = 'https://andryus0312-collab.github.io/sharep2p/';
        
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrMessage)}&color=667eea`;
            
            const qrImage = document.createElement('img');
            qrImage.src = qrUrl;
            qrImage.alt = 'Código QR de invitación';
            qrImage.style.width = '200px';
            qrImage.style.height = '200px';
            qrImage.style.animation = 'zoomIn 0.5s ease-out';
            
            qrcodeContainer.appendChild(qrImage);
            
            setTimeout(() => {
                qrModal.classList.add('active');
                console.log('✅ QR generado exitosamente');
            }, 100);
            
        } catch (error) {
            console.error('❌ Error al generar QR:', error);
            alert('Error al generar el código QR: ' + error.message);
        }
    });

    // Cerrar modal del QR
    closeQrModal.addEventListener('click', () => {
        qrModal.classList.remove('active');
    });

    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
        }
    });

    // Copiar enlace del QR
    copyLinkBtn.addEventListener('click', () => {
        qrLinkInput.select();
        qrLinkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(qrLinkInput.value);
            copyLinkBtn.textContent = '✅ Copiado';
            setTimeout(() => {
                copyLinkBtn.textContent = '📋 Copiar';
            }, 2000);
        } catch (error) {
            document.execCommand('copy');
            copyLinkBtn.textContent = '✅ Copiado';
            setTimeout(() => {
                copyLinkBtn.textContent = '📋 Copiar';
            }, 2000);
        }
    });

    // ============================================
    // 🔍 CONSOLA DE DEPURACIÓN
    // ============================================
    
    let logs = [];
    const addLog = (msg, type='info') => {
        logs.push({msg, type, time: new Date().toLocaleTimeString()});
        document.getElementById('debugOutput').innerHTML = logs.map(l => 
            `<div class="log-line ${l.type}">[${l.time}] ${l.msg}</div>`
        ).join('');
    };

    debugBtn.addEventListener('click', () => {
        debugPanel.classList.add('active');
        logs = [];
        addLog('🔍 Diagnóstico iniciado', 'info');
        addLog(navigator.share ? '✅ Web Share API: OK' : '❌ Web Share API: Falta', navigator.share ? 'success' : 'error');
        addLog(window.location.protocol === 'https:' ? '✅ HTTPS: OK' : '⚠️ HTTPS: Falta', window.location.protocol === 'https:' ? 'success' : 'error');
        addLog('✅ Librería QR: Usando API externa', 'success');
        addLog(document.body.classList.contains('dark-mode') ? ' Modo oscuro: ACTIVO' : '☀️ Modo claro: ACTIVO', 'info');
    });

    document.getElementById('closeDebug').addEventListener('click', () => debugPanel.classList.remove('active'));
    document.getElementById('clearDebug').addEventListener('click', () => { 
        logs = []; 
        document.getElementById('debugOutput').innerHTML = ''; 
    });

    //  Función para reiniciar la app después de compartir
function resetApp() {
    console.log('🧹 Reiniciando app...');
    
    // Limpiar archivos seleccionados
    selectedFiles = [];
    
    // Limpiar vista previa
    previewContainer.innerHTML = '';
    
    // Limpiar lista de archivos
    fileList.innerHTML = '';
    
    // Resetear input de archivos (para que pueda seleccionar el mismo archivo de nuevo)
    fileInput.value = '';
    
    // Desactivar botón de compartir
    shareBtn.disabled = true;
    shareBtn.classList.remove('active');
    shareBtn.querySelector('.btn-text').textContent = 'Compartir';
    
    console.log('✅ App reiniciada, lista para nueva selección');
}

    
});
