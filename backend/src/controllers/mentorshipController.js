import db from '../config/db.js';

export const createMentorship = async (req, res) => {
    const { mentor_id, apprentice_id, subject_id, scheduled_date, objectives, modality, meeting_place, platform } = req.body;

    if (!mentor_id || !apprentice_id || !subject_id || !scheduled_date) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const query = `
            INSERT INTO Mentorships (mentor_id, apprentice_id, subject_id, scheduled_date, objectives, status, modality, meeting_place, platform)
            VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [mentor_id, apprentice_id, subject_id, scheduled_date, objectives, modality || 'Presencial', meeting_place, platform]);
        
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
                mentor.full_name as mentor_name,
                apprentice.full_name as apprentice_name,
                s.name as subject_name
            FROM Mentorships m
            JOIN Users mentor ON m.mentor_id = mentor.id
            JOIN Users apprentice ON m.apprentice_id = apprentice.id
            JOIN Subjects s ON m.subject_id = s.id
            WHERE (m.mentor_id = ? OR m.apprentice_id = ?)
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
    const { status, scheduled_date, meeting_link, zoom_code, zoom_password } = req.body;
    try {
        let query = "UPDATE Mentorships SET ";
        const params = [];
        const updates = [];

        if (status) {
            updates.push("status = ?, apprentice_notified = 0");
            params.push(status);
        }
        if (scheduled_date) {
            updates.push("scheduled_date = ?");
            params.push(scheduled_date);
        }
        if (meeting_link) {
            updates.push("meeting_link = ?");
            params.push(meeting_link);
        }
        if (zoom_code) {
            updates.push("zoom_code = ?");
            params.push(zoom_code);
        }
        if (zoom_password) {
            updates.push("zoom_password = ?");
            params.push(zoom_password);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No hay campos para actualizar" });
        }

        query += updates.join(", ") + " WHERE id = ?";
        params.push(id);

        await db.query(query, params);
        res.json({ message: "Tutoría actualizada correctamente" });
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
            "SELECT COUNT(*) as count FROM Mentorships WHERE mentor_id = ? AND status = 'PENDIENTE'",
            [userId]
        );

        // Conteo para el aprendiz: Respuestas (status != PENDIENTE) no leídas
        const [newInboxApprentice] = await db.query(
            "SELECT COUNT(*) as count FROM Mentorships WHERE apprentice_id = ? AND status != 'PENDIENTE' AND apprentice_notified = 0",
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

