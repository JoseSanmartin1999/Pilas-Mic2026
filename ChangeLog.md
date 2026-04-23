# ChangeLog - Sistema de Tutorías (Pilas-Mic2026)

Este documento registra las mejoras y cambios realizados en el sistema de tutorías para optimizar la coordinación entre mentores y alumnos.

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

