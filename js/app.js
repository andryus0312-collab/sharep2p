document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Cargado - App iniciada');

    // ============================================
    // 🗄️ CONFIGURACIÓN DE SUPABASE
    // ============================================
    // ⚠️ URL CORREGIDA (con la 's' en lugar de doble 'c')
    const SUPABASE_URL = 'https://lvfkjdcaspaesmjvsiyv.supabase.co';
    
    // ⚠️ PEGA TU API KEY AQUÍ ABAJO (entre las comillas)
    // Usa el botón "Copiar" de tu dashboard de Supabase (Settings -> API)
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmtqZGNhc3BhZXNtanZzaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTQzNzgsImV4cCI6MjEwNjE5MDM3OH0.vnGTTA5eJa9eH8xh-pkBpMsQlkocXNDKVI_MSlFAbFI'; 
    
    let supabaseClient = null;
    if (window.supabase && SUPABASE_KEY !=='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmtqZGNhc3BhZXNtanZzaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTQzNzgsImV4cCI6MjEwNjE5MDM3OH0.vnGTTA5eJa9eH8xh-pkBpMsQlkocXNDKVI_MSlFAbFI') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase conectado');
    } else {
        console.error('❌ Librería Supabase no cargada o falta la Key');
    }

    // Función para registrar en DB
    async function logTransfer(file, method) {
        if (!supabaseClient) return;
        try {
            const { error } = await supabaseClient.from('transferencias').insert([
                {
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    share_method: method,
                    user_agent: navigator.userAgent
                }
            ]);
            if (error) console.error('❌ Error Supabase:', error);
            else console.log('📝 Registro guardado en DB:', file.name);
        } catch (e) { console.error(e); }
    }

    // 1️⃣ Elementos del HTML
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const shareBtn = document.getElementById('shareBtn');
    const debugBtn = document.getElementById('debugBtn');
    const debugPanel = document.getElementById('debugPanel');
    const previewContainer = document.getElementById('previewContainer');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const themeToggle = document.getElementById('themeToggle');
    
    const qrBtn = document.getElementById('qrBtn');
    const qrModal = document.getElementById('qrModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrLinkInput = document.getElementById('qrLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    let selectedFiles = [];

    // 🌙 MODO OSCURO
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

    // 📂 SELECCIÓN DE ARCHIVOS
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
            
            // Detectar PC vs Móvil
            const canShare = navigator.canShare && navigator.canShare({ files: selectedFiles });
            shareBtn.querySelector('.btn-text').textContent = canShare ? `Compartir (${selectedFiles.length})` : `Descargar (${selectedFiles.length})`;
            
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

    // 🚀 COMPARTIR O DESCARGAR (CON SUPABASE)
    shareBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        const canShareFiles = navigator.canShare && navigator.canShare({ files: selectedFiles });

        try {
            showProgress(20, '⏳ Preparando archivos...');

            const signatureMessage = `🎉✨ *ARCHIVO COMPARTIDO* 📤✨\n🚀 ShareP2P\n🔗 https://andryus0312-collab.github.io/sharep2p/\n💙 Hecho con 💙 por Sr. Andryus`;

            if (canShareFiles) {
                // MÓVIL
                showProgress(50, '📤 Abriendo menú nativo...');
                await navigator.share({
                    files: selectedFiles,
                    title: 'Archivos ShareP2P',
                    text: signatureMessage
                });
                
                for (const file of selectedFiles) await logTransfer(file, 'web_share');
                showProgress(100, '✅ ¡Compartido con éxito!');

            } else {
                // PC (DESCARGA)
                showProgress(50, '💻 Descargando a tu equipo...');
                
                for (const file of selectedFiles) {
                    const url = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    await logTransfer(file, 'download');
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                showProgress(100, '✅ ¡Descarga completada!');
            }

            setTimeout(() => { hideProgress(); resetApp(); }, 2500);

        } catch (err) {
            if (err.name !== 'AbortError') {
                showProgress(0, '❌ Error: ' + err.message, true);
                setTimeout(hideProgress, 3000);
            } else {
                hideProgress();
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

    // 📱 GENERAR CÓDIGO QR
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

    // 🔍 CONSOLA DE DEPURACIÓN
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
        addLog(supabaseClient ? '✅ Supabase: Conectado' : '❌ Supabase: Falta librería o Key', supabaseClient ? 'success' : 'error');
        
        const canShareFiles = navigator.canShare && navigator.canShare({ files: [new File([''], 'test.txt')] });
        addLog(canShareFiles ? '✅ Web Share API: OK' : '⚠️ Modo Descarga (PC) activado', canShareFiles ? 'success' : 'info');
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

    // ⚡ SERVICE WORKER
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('✅ Service Worker registrado'))
                .catch((err) => console.error('❌ Error SW:', err));
        });
    }
});
