# 📤 Compartir Archivos P2P

<div align="center">

![GitHub](https://img.shields.io/github/last-commit/tu-usuario/tu-repo?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)

**Comparte archivos fácilmente por Bluetooth, Wi-Fi o cualquier método nativo de tu dispositivo**

[Demo en Vivo](https://tu-usuario.github.io/tu-repo/) • [Reportar Bug](https://github.com/tu-usuario/tu-repo/issues) • [Sugerir Mejora](https://github.com/tu-usuario/tu-repo/issues)

</div>

---

## 🎯 ¿Qué es esto?

Una **Progressive Web App (PWA)** ligera y rápida que te permite compartir archivos entre dispositivos usando las APIs nativas del sistema operativo. 

### ✨ Características Principales

- 📱 **100% Web** - No necesitas instalar ninguna app
- 📡 **Bluetooth + Wi-Fi** - Usa los métodos nativos de tu dispositivo
- 🔒 **Seguro** - HTTPS obligatorio, datos cifrados
- 🟩 **Supabase Integrado** - Registro automático de transferencias
- ⚡ **Rápido** - Carga en menos de 1 segundo
- 🌐 **Funciona Offline** - Gracias a Service Workers

---

## 🚀 Cómo Usar

### Opción 1: Acceder desde el Navegador

1. 🌐 Abre este enlace en tu celular: `https://tu-usuario.github.io/tu-repo/`
2. 📂 Toca el botón **"Seleccionar Archivos"**
3. 📸 Elige las fotos, videos o documentos que quieres compartir
4. 🚀 Toca **"Compartir por Bluetooth/Wi-Fi"**
5. 📱 En el menú que aparece, elige **Bluetooth** o **Wi-Fi Direct**
6. ✅ ¡Listo! El archivo se enviará

### Opción 2: Instalar como App (PWA)

1. 🌐 Abre el enlace en **Chrome para Android**
2. 📲 Toca el menú (⋮) → **"Agregar a pantalla principal"**
3. 🏠 Ahora tienes un ícono en tu pantalla de inicio
4. 🎉 Ábrelo como si fuera una app normal

---

## 🛠️ Requisitos Técnicos

### Para Usar la App

- 📱 **Android 7.0+** con Chrome, Edge o Samsung Internet
- 🔒 **HTTPS obligatorio** (GitHub Pages lo incluye automáticamente)
- 📶 **Bluetooth o Wi-Fi** activado en tu dispositivo

### Para Desarrollar

- 💻 **Node.js 16+** (opcional, solo si quieres modificar el código)
- 🐙 **Git** para control de versiones
- 🟩 **Cuenta en Supabase** (gratis)

---

## 🏗️ Estructura del Proyecto

.
├── 📄 index.html          # Página principal
├── 🎨 styles.css          # Estilos visuales
├── ⚙️ app.js              # Lógica de la aplicación
├── 📱 manifest.json       # Configuración PWA
├── 🔧 service-worker.js   # Funcionalidad offline
├── 📖 README.md           # Este archivo
└── 📜 LICENSE             # Licencia MIT

---

## 🟩 Configuración de Supabase

1. Crea una cuenta en [Supabase](https://supabase.com) (gratis)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta:

```sql
CREATE TABLE transfer_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT,
    files_count INTEGER,
    files_names TEXT[],
    total_size BIGINT,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transfer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON transfer_logs
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
```

4. Copia tu **URL del proyecto** y **anon key** desde Settings → API
5. Pégalos en `app.js` (líneas 2-3)

---

## 🚀 Despliegue en GitHub Pages

### Paso 1: Crear el Workflow

Crea el archivo `.github/workflows/deploy.yml` con el contenido del workflow de GitHub Actions.

### Paso 2: Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/ (root)`
4. Guarda

### Paso 3: Acceder a tu App

Tu app estará disponible en:

https://tu-usuario.github.io/nombre-del-repo/

---

## 🔒 Privacidad y Retención de Datos

En **ShareP2P**, la privacidad es una prioridad. Queremos ser totalmente transparentes sobre cómo manejamos los datos:

- **Sin almacenamiento de archivos:** La aplicación **NUNCA** sube, almacena ni tiene acceso al contenido de los archivos que compartes. La transferencia se realiza directamente entre dispositivos o mediante los servicios nativos de tu sistema operativo (Bluetooth, WhatsApp, etc.).
- **Registros anónimos de uso:** Para mejorar la aplicación, se guardan registros anónimos de las transferencias (nombre del archivo, tamaño, método usado y fecha). **No se guarda ningún dato personal ni contenido del archivo.**
- **Auto-eliminación:** Todos los registros de uso se **eliminan automáticamente de la base de datos cada 3 días** mediante una política de retención automática. Esto garantiza que no se acumule información innecesaria y se respete tu privacidad.
- **Cero rastreo:** No utilizamos cookies de seguimiento, ni analizamos tu ubicación GPS, ni vendemos datos a terceros.

*Si tienes alguna duda sobre nuestra política de privacidad, puedes contactarnos a través de los issues del repositorio.*

---

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! 🎉

1. 🍴 Haz un **Fork** del proyecto
2. 🌿 Crea una rama para tu función (`git checkout -b feature/NuevaFuncion`)
3. 💾 Haz **Commit** de tus cambios (`git commit -m 'Agregar nueva función'`)
4. 📤 Haz **Push** a la rama (`git push origin feature/NuevaFuncion`)
5. 🎯 Abre un **Pull Request**

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Sr. Andryus** 🌟

- 💼 GitHub: [@tu-usuario](https://github.com/tu-usuario)
- 📧 Email: zacariasmelo1981@gmail.com

---

## 🙏 Agradecimientos

- 🟩 [Supabase](https://supabase.com) - Base de datos en tiempo real
- 🟧 [Firebase](https://firebase.google.com) - Autenticación y notificaciones
- 🐙 [GitHub Pages](https://pages.github.com) - Hosting gratuito
- 📱 Web Share API - Por hacer posible compartir archivos desde la web

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

Hecho con ❤️ y mucho ☕

</div>
