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
    
    let selectedFiles = [];

    // 2️ LÓGICA: Cuando el usuario selecciona archivos
    fileInput.addEventListener('change', (e) => {
        console.log('📂 Archivos detectados:', e.target.files.length);
        selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles.length > 0) {
            // Mostrar la lista visualmente
            fileList.innerHTML = selectedFiles.map(file => `
                <div class="file-item">
                    <span>📄 ${file.name}</span>
                    <span>${(file.size / 1024).toFixed(1)} KB</span>
                </div>
            `).join('');
            
            // Activar el botón de compartir (cambio de estilo y texto)
            shareBtn.disabled = false;
            shareBtn.classList.add('active');
            shareBtn.textContent = `🚀 Compartir (${selectedFiles.length})`;
        } else {
            // Si no hay archivos, limpiar todo
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
            statusDiv.textContent = ' Preparando archivos...';
            statusDiv.className = 'status success';
            
            // Crear el mensaje de firma con emojis y enlace
            const signatureMessage = selectedFiles.map(file => {
                return `🎉✨📤 *ARCHIVO COMPARTIDO* 📤✨

📄 *Nombre:* ${file.name}
📦 *Tamaño:* ${(file.size / 1024).toFixed(1)} KB

━━━━━━━━━━━━━━━━━━━━━━━
 *Compartido a través de:*
📱 *ShareP2P* - Tu app de compartir archivos

🔗 *Visita la app:*
👉 https://andryus0312-collab.github.io/sharep2p/
━━━━━━━━━━━━━━━━━━━━━━━

💙 *Hecho con 🩵 por Sr. Andryus* 💙
 ¡Gracias por usar ShareP2P! 🌟`;
            }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━\n\n');
            
            statusDiv.textContent = '📤 Abriendo menú de compartir...';
            
            // Llamar a la API nativa del celular con el mensaje personalizado
            await navigator.share({
                files: selectedFiles,
                title: '📤 Archivos compartidos con ShareP2P',
                text: signatureMessage
            });
            
            statusDiv.textContent = '✅ ¡Compartido con éxito!';
            
            // Ocultar el mensaje después de 3 segundos
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
            
        } catch (err) {
            // Si el usuario cancela, no mostramos error grave
            if (err.name !== 'AbortError') {
                statusDiv.textContent = '❌ Error: ' + err.message;
                statusDiv.className = 'status error';
            } else {
                statusDiv.textContent = '⚠️ Compartición cancelada';
                statusDiv.className = 'status success';
            }
        }
    });

    // 4️⃣ LÓGICA: Consola de Depuración (La Lupa)
    let logs = [];
    const addLog = (msg, type='info') => {
        logs.push({msg, type, time: new Date().toLocaleTimeString()});
        document.getElementById('debugOutput').innerHTML = logs.map(l => 
            `<div class="log-line ${l.type}">[${l.time}] ${l.msg}</div>`
        ).join('');
    };

    debugBtn.addEventListener('click', () => {
        debugPanel.classList.add('active');
        logs = []; // Limpiar logs anteriores
        addLog('🔍 Diagnóstico iniciado', 'info');
        addLog(navigator.share ? '✅ Web Share API: OK' : '❌ Web Share API: Falta', navigator.share ? 'success' : 'error');
        addLog(window.location.protocol === 'https:' ? '✅ HTTPS: OK' : '⚠️ HTTPS: Falta', window.location.protocol === 'https:' ? 'success' : 'error');
    });

    document.getElementById('closeDebug').addEventListener('click', () => debugPanel.classList.remove('active'));
    document.getElementById('clearDebug').addEventListener('click', () => { 
        logs = []; 
        document.getElementById('debugOutput').innerHTML = ''; 
    });
});
