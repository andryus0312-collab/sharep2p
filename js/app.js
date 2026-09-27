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
    
    // 🆕 NUEVOS: Elementos del QR
    const qrBtn = document.getElementById('qrBtn');
    const qrModal = document.getElementById('qrModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrLinkInput = document.getElementById('qrLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    
    let selectedFiles = [];

    // 2️⃣ LÓGICA: Cuando el usuario selecciona archivos
    fileInput.addEventListener('change', (e) => {
        console.log('📂 Archivos detectados:', e.target.files.length);
        selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles.length > 0) {
            fileList.innerHTML = selectedFiles.map(file => `
                <div class="file-item">
                    <span>📄 ${file.name}</span>
                    <span>${(file.size / 1024).toFixed(1)} KB</span>
                </div>
            `).join('');
            
            shareBtn.disabled = false;
            shareBtn.classList.add('active');
            shareBtn.textContent = `🚀 Compartir (${selectedFiles.length})`;
        } else {
            fileList.innerHTML = '';
            shareBtn.disabled = true;
            shareBtn.classList.remove('active');
            shareBtn.textContent = '🚀 Compartir';
        }
    });

    // 3️⃣ LÓGICA: Cuando el usuario toca "Compartir"
    shareBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;
        
        try {
            statusDiv.textContent = '📤 Preparando archivos...';
            statusDiv.className = 'status success';
            
            const signatureMessage = selectedFiles.map(file => {
                return `🎉✨ *ARCHIVO COMPARTIDO* 📤✨🎉

📄 *Nombre:* ${file.name}
📦 *Tamaño:* ${(file.size / 1024).toFixed(1)} KB

━━━━━━━━━━━━━━━━━━━━━━━
📱 *Compartido a través de:*
 *ShareP2P* - Tu app de compartir archivos

🔗 *Visita la app:*
👉 https://andryus0312-collab.github.io/sharep2p/
━━━━━━━━━━━━━━━━━━━━━━━

💙 *Hecho con  por Sr. Andryus* 💙
🌟 ¡Gracias por usar ShareP2P! 🌟`;
            }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━\n\n');
            
            statusDiv.textContent = '📤 Abriendo menú de compartir...';
            
            await navigator.share({
                files: selectedFiles,
                title: '📤 Archivos compartidos con ShareP2P',
                text: signatureMessage
            });
            
            statusDiv.textContent = '✅ ¡Compartido con éxito!';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
            
        } catch (err) {
            if (err.name !== 'AbortError') {
                statusDiv.textContent = '❌ Error: ' + err.message;
                statusDiv.className = 'status error';
            } else {
                statusDiv.textContent = '⚠️ Compartición cancelada';
                statusDiv.className = 'status success';
            }
        }
    });

    //  4️⃣ LÓGICA: Generar código QR de invitación
    qrBtn.addEventListener('click', () => {
        console.log('📱 Generando código QR...');
        
        // Limpiar QR anterior
        qrcodeContainer.innerHTML = '';
        
        // Crear el mensaje que irá en el QR
        const qrMessage = `¡Hola! Te invito a usar ShareP2P para compartir archivos de forma rápida y segura.

🔗 https://andryus0312-collab.github.io/sharep2p/

💙 Hecho con 🩵 por Sr. Andryus`;
        
        // Poner el enlace en el input
        qrLinkInput.value = 'https://andryus0312-collab.github.io/sharep2p/';
        
        // Generar el código QR usando la API de Google (más confiable)
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrMessage)}&color=667eea`;
            
            const qrImage = document.createElement('img');
            qrImage.src = qrUrl;
            qrImage.alt = 'Código QR de invitación';
            qrImage.style.width = '200px';
            qrImage.style.height = '200px';
            
            qrcodeContainer.appendChild(qrImage);
            
            // Mostrar el modal
            setTimeout(() => {
                qrModal.classList.add('active');
                console.log('✅ QR generado exitosamente');
            }, 100);
            
        } catch (error) {
            console.error('❌ Error al generar QR:', error);
            alert('Error al generar el código QR: ' + error.message);
        }
    });

    // 🆕 5️⃣ LÓGICA: Cerrar modal del QR
    closeQrModal.addEventListener('click', () => {
        qrModal.classList.remove('active');
    });

    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
        }
    });

    // 🆕 6️⃣ LÓGICA: Copiar enlace del QR
    copyLinkBtn.addEventListener('click', () => {
        qrLinkInput.select();
        qrLinkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(qrLinkInput.value);
            copyLinkBtn.textContent = '✅ Copiado';
            setTimeout(() => {
                copyLinkBtn.textContent = ' Copiar';
            }, 2000);
        } catch (error) {
            document.execCommand('copy');
            copyLinkBtn.textContent = '✅ Copiado';
            setTimeout(() => {
                copyLinkBtn.textContent = '📋 Copiar';
            }, 2000);
        }
    });

    // 7️ LÓGICA: Consola de Depuración (La Lupa)
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
    });

    document.getElementById('closeDebug').addEventListener('click', () => debugPanel.classList.remove('active'));
    document.getElementById('clearDebug').addEventListener('click', () => { 
        logs = []; 
        document.getElementById('debugOutput').innerHTML = ''; 
    });
});
