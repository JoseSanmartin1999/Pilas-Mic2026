# Pilas! - Aplicación de Mentorías 🚀

¡Bienvenido al repositorio principal de Pilas! Esta guía te ayudará a configurar y ejecutar el proyecto localmente. El proyecto está dividido en dos partes principales:

1. **Frontend**: Desarrollado en React.js con Vite y estilizado mediante Tailwind CSS.
2. **Backend**: API REST en Node.js, Express y MySQL (TiDB), incluyendo subida de imágenes gestionada mediante Cloudinary.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- **Node.js** (v18 o superior recomendado)
- **Git**

---

## 🚀 Instalación y Ejecución

A continuación encontrarás los pasos para arrancar ambos entornos (Cliente y Servidor) simultáneamente.

### 1. Configuración del Backend

Abre una terminal y navega a la carpeta del backend.

```bash
cd backend
npm install
```

**Variables de Entorno:**
Necesitas crear un archivo `.env` en la raíz del directorio `backend/` con las siguientes llaves (pide las credenciales al administrador de BD):

```env
# Ejemplo de backend/.env
DB_HOST=tu-host
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=tu-base-datos
DB_PORT=4000
JWT_SECRET=tu-secreto-jwt
CLOUDINARY_CLOUD_NAME=tu-nombre-cloudinary
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

**Ejecución:**
```bash
# Iniciar servidor en modo desarrollo
npm run dev

# (O alternativamente)
npm start
```

> El servidor por defecto corre en `http://localhost:3000`

### 2. Configuración del Frontend

Abre **una nueva pestaña/ventana de terminal**, manteniendo el backend corriendo, y navega a la carpeta del frontend:

```bash
cd frontend
npm install
```

**Variables de Entorno (Opcional):**
Actualmente las llamadas a la API apuntan estáticamente a `http://localhost:3000` por defecto en la aplicación, por lo que no requieres levantar variables de entorno para pruebas locales.

**Ejecución:**
```bash
# Iniciar frontend con Vite
npm run dev
```

> La interfaz estará disponible en tu navegador visitando la dirección provista en consola, usualmente alojada en `http://localhost:5173`.

---

¡Eso es todo! Ahora puedes registrarte o iniciar sesión para acceder al sistema completo de **Pilas**. 🎉
