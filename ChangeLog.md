# ChangeLog - Sistema de Tutorías (Pilas-Mic2026)

Este documento registra las mejoras y cambios realizados en el sistema de tutorías para optimizar la coordinación entre mentores y alumnos.

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

