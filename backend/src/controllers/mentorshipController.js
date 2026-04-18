import db from '../config/db.js';

export const createMentorship = async (req, res) => {
    const { mentor_id, apprentice_id, subject_id, scheduled_date, objectives } = req.body;

    if (!mentor_id || !apprentice_id || !subject_id || !scheduled_date) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const query = `
            INSERT INTO Mentorships (mentor_id, apprentice_id, subject_id, scheduled_date, objectives, status)
            VALUES (?, ?, ?, ?, ?, 'PENDIENTE')
        `;
        
        const [result] = await db.query(query, [mentor_id, apprentice_id, subject_id, scheduled_date, objectives]);
        
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
                mentor.full_name as mentor_name,
                apprentice.full_name as apprentice_name,
                s.name as subject_name
            FROM Mentorships m
            JOIN Users mentor ON m.mentor_id = mentor.id
            JOIN Users apprentice ON m.apprentice_id = apprentice.id
            JOIN Subjects s ON m.subject_id = s.id
            WHERE (m.mentor_id = ? OR m.apprentice_id = ?) AND m.status = 'PENDIENTE'
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
    const { status, scheduled_date } = req.body;
    try {
        let query = "UPDATE Mentorships SET ";
        const params = [];
        if (status) {
            query += "status = ?, apprentice_notified = 0 "; // Reset notifications when status changes
            params.push(status);
        }
        if (scheduled_date) {
            query += (status ? ", " : "") + "scheduled_date = ? ";
            params.push(scheduled_date);
        }
        query += "WHERE id = ?";
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

