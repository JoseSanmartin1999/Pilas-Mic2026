import db from '../config/db.js';
import { sendMentorshipStatusEmail, sendMentorshipReprogramEmail } from '../services/emailService.js';

export const createMentorship = async (req, res) => {
    const { mentor_id, apprentice_id, subject_id, scheduled_date, objectives, modality, meeting_place, platform, estimated_duration } = req.body;

    if (!mentor_id || !apprentice_id || !subject_id || !scheduled_date) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const query = `
            INSERT INTO Mentorships (mentor_id, apprentice_id, subject_id, scheduled_date, objectives, status, modality, meeting_place, platform, estimated_duration)
            VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [mentor_id, apprentice_id, subject_id, scheduled_date, objectives, modality || 'Presencial', meeting_place, platform, estimated_duration || '1 hora']);
        
        res.status(201).json({
            message: "Tutoría solicitada exitosamente",
            mentorshipId: result.insertId
        });
    } catch (error) {
        console.error("Error al crear tutoría:", error);
        res.status(500).json({ error: "Ocurrió un error al solicitar la tutoría", details: error.message });
    }
};

export const getMentorshipsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `
            SELECT 
                m.id, 
                m.scheduled_date, 
                m.objectives, 
                m.status,
                m.mentor_id,
                m.apprentice_id,
                m.modality,
                m.meeting_place,
                m.platform,
                m.meeting_link,
                m.zoom_code,
                m.zoom_password,
                m.reprogramming_count,
                m.reprogramming_reason,
                m.last_initiator_role,
                m.apprentice_notified,
                m.estimated_duration,
                mentor.full_name as mentor_name,
                apprentice.full_name as apprentice_name,
                s.name as subject_name
            FROM Mentorships m
            JOIN Users mentor ON m.mentor_id = mentor.id
            JOIN Users apprentice ON m.apprentice_id = apprentice.id
            JOIN Subjects s ON m.subject_id = s.id
            WHERE (m.mentor_id = ? OR m.apprentice_id = ?) AND m.is_deleted = 0
            ORDER BY m.created_at DESC
        `;
        const [rows] = await db.query(query, [userId, userId]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching mentorships:", error);
        res.status(500).json({ error: "Error al obtener las tutorías" });
    }
};

export const updateMentorship = async (req, res) => {
    const { id } = req.params;
    const { 
        status, 
        scheduled_date, 
        meeting_link, 
        zoom_code, 
        zoom_password, 
        modality, 
        meeting_place, 
        platform, 
        reprogramming_reason, 
        last_initiator_role 
    } = req.body;

    try {
        // Primero obtenemos el estado actual para la lógica de contador y notificaciones
        const [current] = await db.query(`
            SELECT m.reprogramming_count, m.status, 
                   a.email as apprentice_email, a.full_name as apprentice_name, 
                   mt.email as mentor_email, mt.full_name as mentor_name, 
                   s.name as subject_name
            FROM Mentorships m
            JOIN Users a ON m.apprentice_id = a.id
            JOIN Users mt ON m.mentor_id = mt.id
            JOIN Subjects s ON m.subject_id = s.id
            WHERE m.id = ?
        `, [id]);
        if (current.length === 0) return res.status(404).json({ error: "Tutoría no encontrada" });
        
        let newCount = current[0].reprogramming_count;
        let finalStatus = status || current[0].status;

        // Lógica de reprogramación: si se propone cambio de fecha o lugar mientras está pendiente
        if (scheduled_date || meeting_place || modality) {
            newCount += 1;
            // Límite de 2 intentos de reprogramación (3era propuesta cancela)
            if (newCount > 2) {
                finalStatus = 'CANCELADA';
            }
        }

        let query = "UPDATE Mentorships SET ";
        const params = [];
        const updates = [];

        // Siempre reseteamos la notificación del aprendiz si hay cambios
        updates.push("status = ?, apprentice_notified = 0, reprogramming_count = ?");
        params.push(finalStatus, newCount);

        if (scheduled_date) { updates.push("scheduled_date = ?"); params.push(scheduled_date); }
        if (meeting_link) { updates.push("meeting_link = ?"); params.push(meeting_link); }
        if (zoom_code) { updates.push("zoom_code = ?"); params.push(zoom_code); }
        if (zoom_password) { updates.push("zoom_password = ?"); params.push(zoom_password); }
        if (modality) { updates.push("modality = ?"); params.push(modality); }
        if (meeting_place) { updates.push("meeting_place = ?"); params.push(meeting_place); }
        if (platform) { updates.push("platform = ?"); params.push(platform); }
        if (reprogramming_reason) { updates.push("reprogramming_reason = ?"); params.push(reprogramming_reason); }
        if (last_initiator_role) { updates.push("last_initiator_role = ?"); params.push(last_initiator_role); }

        query += updates.join(", ") + " WHERE id = ?";
        params.push(id);

        await db.query(query, params);
        
        // Enviar correo de propuesta de reprogramación si hay cambio de fecha y se especifica el iniciador
        if (scheduled_date && last_initiator_role && current.length > 0) {
            try {
                if (last_initiator_role === 'MENTOR') {
                    // El tutor reprograma -> notificar al aprendiz
                    await sendMentorshipReprogramEmail(
                        current[0].apprentice_email,
                        current[0].apprentice_name,
                        current[0].mentor_name,
                        current[0].subject_name,
                        scheduled_date,
                        reprogramming_reason || 'No especificado',
                        'MENTOR'
                    );
                } else if (last_initiator_role === 'APRENDIZ') {
                    // El aprendiz reprograma -> notificar al tutor/mentor
                    await sendMentorshipReprogramEmail(
                        current[0].mentor_email,
                        current[0].mentor_name,
                        current[0].apprentice_name,
                        current[0].subject_name,
                        scheduled_date,
                        reprogramming_reason || 'No especificado',
                        'APRENDIZ'
                    );
                }
            } catch (err) {
                console.error("No se pudo enviar el correo de propuesta de reprogramación:", err);
            }
        }
        
        // Enviar correo si el estado cambia a ACEPTADA o RECHAZADA
        if (status && (finalStatus === 'ACEPTADA' || finalStatus === 'RECHAZADA') && finalStatus !== current[0].status) {
            try {
                await sendMentorshipStatusEmail(
                    current[0].apprentice_email, 
                    current[0].apprentice_name, 
                    current[0].mentor_name, 
                    finalStatus, 
                    current[0].subject_name
                );
            } catch(err) {
                console.error("No se pudo enviar el correo de actualización de estado:", err);
            }
        }
        
        res.json({ 
            message: finalStatus === 'CANCELADA' ? "Tutoría cancelada por límite de intentos superado" : "Tutoría actualizada correctamente",
            status: finalStatus,
            reprogramming_count: newCount
        });
    } catch (error) {
        console.error("Error updating mentorship:", error);
        res.status(500).json({ error: "No se pudo actualizar la tutoría" });
    }
};

export const getNotificationCounts = async (req, res) => {
    const { userId } = req.params;
    try {
        // Conteo para el mentor: Tutorías en estado PENDIENTE recibidas
        const [pendingMentor] = await db.query(
            "SELECT COUNT(*) as count FROM Mentorships WHERE mentor_id = ? AND status = 'PENDIENTE' AND is_deleted = 0",
            [userId]
        );

        // Conteo para el aprendiz: Respuestas (status != PENDIENTE) no leídas
        const [newInboxApprentice] = await db.query(
            "SELECT COUNT(*) as count FROM Mentorships WHERE apprentice_id = ? AND status != 'PENDIENTE' AND apprentice_notified = 0 AND is_deleted = 0",
            [userId]
        );

        res.json({
            pendingSolicitudes: pendingMentor[0].count,
            newInboxMessages: newInboxApprentice[0].count
        });
    } catch (error) {
        console.error("Error fetching counts:", error);
        res.status(500).json({ error: "Error al obtener contadores" });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE Mentorships SET apprentice_notified = 1 WHERE id = ?", [id]);
        res.json({ message: "Notificación marcada como leída" });
    } catch (error) {
        console.error("Error marking as read:", error);
        res.status(500).json({ error: "No se pudo marcar como leída" });
    }
};

export const deleteMentorship = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE Mentorships SET is_deleted = 1 WHERE id = ?", [id]);
        res.json({ message: "Tutoría eliminada lógicamente" });
    } catch (error) {
        console.error("Error deleting mentorship:", error);
        res.status(500).json({ error: "No se pudo eliminar la tutoría" });
    }
};
