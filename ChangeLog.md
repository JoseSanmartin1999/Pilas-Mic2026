# ChangeLog - Sistema de Tutorías (Pilas-Mic2026)

Este documento registra las mejoras y cambios realizados en el sistema de tutorías para optimizar la coordinación entre mentores y alumnos.

## [2026-05-28] - Calendario, Recompensas Gamificadas, Notificaciones Toast, Selección Múltiple y Corrección de Bugs

### Frontend
- **Calendario de Tutorías Aceptadas (`Calendario.jsx` [NEW], `App.jsx`)**:
    - Vista premium de grilla mensual interactiva con indicadores dorados para las tutorías confirmadas (`status === 'ACEPTADA'`).
    - Panel lateral de detalles que despliega horarios, asignaturas, objetivos y enlaces virtuales (Meet, Teams, Zoom con soporte de copiado de contraseñas e ID).
- **Tablero de Recompensas Gamificadas (`Recompensas.jsx` [NEW], `App.jsx`)**:
    - Sistema interactivo con saldo de ESPE-Coins, nivel y progreso de XP del usuario.
    - Cuadrícula de insignias con estados desbloqueados y bloqueados en escala de grises.
    - Tienda virtual de beneficios con validación de saldo, popup de código único y notificaciones Toast al canjear cupones de la ESPE.
- **Buscador de Mentores (`BuscarTutor.jsx`)**:
    - Corregido el bug donde el usuario logueado aparecía listado en su propia búsqueda de tutores, extrayendo el ID de sesión híbrida (localStorage o sessionStorage) y agregando filtros en frontend y backend.
- **Enrutamiento y Perfil Estudiantil (`App.jsx` & `Profile.jsx`)**:
    - Agregado soporte para la ruta `/profile` sin parámetro de ID, redirigiendo de manera inteligente al perfil del usuario autenticado (haciendo uso de sessionStorage o localStorage).
- **Resolución General de Sesión Estudiantil Híbrida (`Mensajes.jsx`, `Solicitudes.jsx`, `MiTutoria.jsx`, `Calendario.jsx`, `Recompensas.jsx`, `Navbar.jsx`)**:
    - Se corrigió de raíz el error sistémico que causaba que la bandeja de entrada (`/mensajes`), la vista de solicitudes (`/solicitudes`), el espacio de trabajo (`/mi-tutoria`), el calendario (`/calendario`) y la barra de navegación no cargaran información del usuario al iniciar sesión sin tildar "Recordarme" (sesión guardada en `sessionStorage` en lugar de `localStorage`).
    - Todos los componentes ahora resuelven el `currentUser` consultando ambos espacios de almacenamiento de forma segura.
    - Se optimizaron y reactivaron los hooks `useEffect` para depender de `currentUser.id`, asegurando cargas precisas de datos y previniendo llamadas fallidas con valores `undefined`.
- **Servicio de Notificación Toast Premium (`NotificationContext.jsx` [NEW], `App.jsx` & `index.css`)**:
    - Creación de un sistema global de alertas flotantes en pantalla (`useNotification`) con diseño glassmorphism adaptativo y soporte para cuatro estados visuales: éxito, error, advertencia e información.
    - Definición de fotogramas clave `@keyframes slide-in` y clase CSS de animación en `index.css`.
    - Eliminación absoluta de las llamadas nativas e intrusivas a `alert()` de todo el proyecto, sustituyéndolas por toasts modernos en `Profile.jsx`, `Register.jsx`, `Solicitudes.jsx`, `Mensajes.jsx` y `TopBar.jsx`.
- **Bandeja de Mensajes (`Mensajes.jsx`)**:
    - Incorporación de casillas de verificación (checkboxes) individuales y controles de selección masiva ("Todos", "Desmarcar") para posibilitar la eliminación en masa (bulk delete) de notificaciones.
    - Creación de un modal de confirmación de borrado en pantalla con estilo premium que reemplaza el diálogo nativo `window.confirm()`.
- **Buscador de Mentores (`BuscarTutor.jsx`)**:
    - Rediseño general con una interfaz de usuario espectacular (UI/UX): tarjetas interactivas con efectos hover y escala 3D, indicador de disponibilidad en línea, puntuación mediante estrellas y etiquetas estilizadas de materias.
    - Integración de píldoras de filtrado dinámico por semestres (del `1°` al `8°` nivel).
    - Sistema de ordenamiento flexible por semestre (ascendente/descendente), nombre y puntuación.
    - Se agregó un badge flotante `🎓 X° Nivel` en cada tarjeta de tutor.
- **Flujo de Acceso y Persistencia (`Login.jsx` & `App.jsx`)**:
    - Sincronización del checkbox "Recordarme" con el estado interno de React.
    - Implementación de persistencia híbrida: almacenamiento en `localStorage` si se marca "Recordarme" (permanente) o en `sessionStorage` si no se marca (temporal, expira al cerrar la pestaña/navegador).
- **Gestión de Perfil (`Profile.jsx`)**:
    - Se solucionó un bug crítico donde se eliminaban las materias impartidas al guardar cambios, corrigiendo la inicialización de los IDs de materias dictadas.
    - Se resolvió el bug que sobreescribía la foto de perfil del usuario a `null` si este no seleccionaba una nueva imagen en el modal, enviando la URL actual por defecto en el payload.

### Backend
- **Controlador de Usuarios (`userController.js`)**:
    - Corregido el bug `500 (Internal Server Error)` al actualizar la foto de perfil, simplificando la lógica para usar directamente `req.file.path` proveído por el middleware de Cloudinary.
    - Se implementó un fallback de seguridad en la base de datos para recuperar y preservar la foto actual del usuario si no se proporciona una nueva ruta ni se carga un archivo, protegiendo contra pérdida accidental de imágenes.
    - Agregado el campo `u.current_semester` a la consulta de `getAllMentors` para posibilitar el filtrado y ordenado por niveles en el cliente.

---

## [2026-05-27] - Recuperación de Contraseña y Notificaciones por Correo

### Frontend
- **Recuperación de Contraseña (`ForgotPassword.jsx` [NEW], `Login.jsx` & `App.jsx`)**:
    - Implementación de la vista completa para el flujo de recuperación de contraseña en tres pasos: solicitud con correo electrónico, verificación del código de 6 dígitos y restablecimiento seguro.
    - Se añadió el enlace "¿Olvidaste tu contraseña?" en el formulario de inicio de sesión.
    - Configuración de la nueva ruta `/forgot-password` en el enrutamiento de la aplicación.

### Backend
- **Servicio de Correo (`emailService.js` [NEW])**:
    - Integración de `nodemailer` con Gmail para el envío de correos.
    - Función `sendPasswordResetEmail`: Envía correos con plantillas HTML y un código seguro de verificación de 6 dígitos con expiración de 5 minutos.
    - Función `sendMentorshipStatusEmail`: Envía notificaciones por correo electrónico al alumno cuando su solicitud es **ACEPTADA** o **RECHAZADA** por el mentor.
- **Controlador de Autenticación (`authController.js`)**:
    - Nuevas funciones `forgotPassword`, `verifyResetCode` y `resetPassword` para gestionar la generación, expiración y verificación de los códigos de seguridad, así como el restablecimiento con hash de bcrypt.
- **Rutas (`authRoutes.js`)**:
    - Nuevos endpoints para `/forgot-password`, `/verify-reset-code` y `/reset-password`.

### Base de Datos
- **Esquema de Usuarios (`migrate.js`)**:
    - Se añadieron columnas `reset_code` y `reset_code_expires_at` para la gestión temporal de recuperación.

---

## [2026-04-21] - Reprogramación, Visualización de Tutorías y Gestión de Notificaciones

### Frontend
- **Mensajes (`Mensajes.jsx`)**:
    - Rediseño de la bandeja para mostrar con mayor detalle las citas e interactuar directamente con las opciones de reprogramación y chat.
- **Solicitudes (`Solicitudes.jsx`) y Perfil (`Profile.jsx`)**:
    - Implementación del sistema de **Reprogramación (Re-agendar)**:
        - Permite proponer nuevas fechas, horas, modalidades o lugares con un límite de hasta 2 intentos antes de la cancelación automática.
        - Campo para justificar la razón del cambio (`reprogramming_reason`).
    - Visualización del estado actual de las tutorías.
    - Opción para eliminar/cancelar lógicamente las tutorías agendadas.
- **Barra de Navegación (`Navbar.jsx`)**:
    - Se agregaron contadores dinámicos de notificaciones (solicitudes pendientes para mentores y respuestas no leídas en la bandeja de entrada para alumnos).

### Backend
- **Controlador de Mentorías (`mentorshipController.js`)**:
    - Lógica de negocio para controlar el número de intentos de reprogramación y la asignación automática de estados (e.g., `CANCELADA` si se supera el límite de intentos).
    - Funciones `getNotificationCounts` para contar alertas pendientes y `markAsRead` para marcar mensajes como leídos.
    - Soporte para eliminación lógica (`deleteMentorship`).
- **Rutas (`mentorshipRoutes.js` y `userRoutes.js`)**:
    - Incorporación de los endpoints `/notification-counts/:userId`, `/:id/read` y `DELETE /:id`.

### Base de Datos
- **Esquema de Mentorías (`migrate.js`)**:
    - Se añadieron las columnas `is_deleted` para borrado lógico y `apprentice_notified` para marcar el estado de lectura de la notificación.

---

## [2026-04-19] - Mejoras en el Flujo de Tutorías

### Frontend
- **Gestión de Perfil (`Profile.jsx`)**:
    - Se rediseñó el modal **"Pactar Tutoría"** para incluir la selección de modalidad (**Presencial** u **Online**).
    - Implementación de lógica condicional:
        - Para **Presencial**: Campo para especificar el lugar de reunión.
        - Para **Online**: Selección de plataforma (Meet, Zoom, Teams).
- **Gestión de Solicitudes (`Solicitudes.jsx`)**:
    - Las tarjetas de solicitud ahora muestran la modalidad y el lugar/plataforma propuestos.
    - Se mejoró el proceso de **"Aceptar Tutoría"**:
        - Si es Online, el mentor ahora debe configurar los datos de acceso (Link de reunión, ID de Zoom o contraseña) antes de confirmar.
- **Bandeja de Entrada (`Mensajes.jsx`)**:
    - Se añadió la sección **"Detalles de la Cita"** en la vista del alumno.
    - Los alumnos ahora pueden ver la ubicación física o el link directo para unirse a sesiones virtuales mediante un botón de acceso rápido.

### Backend
- **Controlador de Mentorías (`mentorshipController.js`)**:
    - Se actualizaron las funciones `createMentorship` y `updateMentorship` para soportar los nuevos campos de modalidad y acceso.
    - La función `getMentorshipsByUser` ahora devuelve la información completa de la cita, permitiendo una experiencia más rica en el frontend.

### Base de Datos
- **Actualización de Esquema (`Mentorships`)**:
    - Se añadieron columnas: `modality`, `meeting_place`, `platform`, `meeting_link`, `zoom_code` y `zoom_password`.

---

