import db from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

// Datos estáticos (Mocks) mientras se implementan las tablas de lógica de negocio
const DEFAULT_SCORE = 4.5;
const DEFAULT_BADGES = [
    { name: 'Primeros Pasos', image_url: 'https://cdn-icons-png.flaticon.com/512/3585/3585145.png' }
];

// Mock de tutorías programadas
const DEFAULT_TUTORIAS = [
    { id: 1, fecha: '2026-03-10', hora: '14:00', materia: 'Física I', estudiante: 'Juan Pérez' },
    { id: 2, fecha: '2026-03-12', hora: '10:00', materia: 'Cálculo Diferencial', estudiante: 'Ana Gómez' }
];

export const getUserProfile = async (req, res) => {
    const { id: userId } = req.params;
    try {
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const userProfile = enrichUserProfileData(user);
        return res.json(userProfile);
    } catch (error) {
        console.error(`Error al obtener perfil del usuario con ID ${userId}:`, error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

/**
 * Actualiza la información del perfil del usuario (RF#003)
 */
export const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { bio, current_semester } = req.body;
    let fotoUrl = req.body.profile_photo_url;

    // Las materias llegan como string JSON desde FormData si es que se envían
    let materias = [];
    if (req.body.materias) {
        try {
            materias = JSON.parse(req.body.materias);
        } catch (e) {
            materias = [];
        }
    }

    try {
        if (req.file) {
            const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                folder: 'pilas_perfiles'
            });
            fotoUrl = uploadRes.secure_url;
        }

        const query = 'UPDATE Users SET bio = ?, current_semester = ?, profile_photo_url = ? WHERE id = ?';
        await db.query(query, [bio, current_semester, fotoUrl, id]);

        // Actualizar Mentor_Subjects
        if (materias.length > 0) {
            const deleteQuery = 'DELETE FROM Mentor_Subjects WHERE mentor_id = ?';
            await db.query(deleteQuery, [id]);

            const insertValues = materias.map(subjectId => [id, subjectId]);
            const insertQuery = 'INSERT INTO Mentor_Subjects (mentor_id, subject_id) VALUES ?';
            // Usamos la sintaxis doble array [[]] para el bulk insert de mysql2
            await db.query(insertQuery, [insertValues]);
        } else if (req.body.materias !== undefined) {
            // Si envían un array vacío se eliminan
            const deleteQuery = 'DELETE FROM Mentor_Subjects WHERE mentor_id = ?';
            await db.query(deleteQuery, [id]);
        }

        // Obtener la información actualizada
        const updatedUser = await findUserById(id);

        res.json({
            message: "Perfil actualizado correctamente",
            fotoUrl,
            bio,
            current_semester,
            materias: updatedUser.materias
        });
    } catch (error) {
        console.error("Error en updateUserProfile:", error);
        res.status(500).json({ error: "No se pudo actualizar el perfil" });
    }
};

// --- Funciones Auxiliares ---

const findUserById = async (userId) => {
    const [users] = await db.query('SELECT * FROM Users WHERE id = ?', [userId]);
    if (users.length === 0) return null;
    const user = users[0];

    // Traer materias dictadas por este mentor como objetos
    try {
        const queryMaterias = `
            SELECT s.id, s.name 
            FROM Subjects s
            INNER JOIN Mentor_Subjects ms ON s.id = ms.subject_id
            WHERE ms.mentor_id = ?
        `;
        const [materiasRows] = await db.query(queryMaterias, [userId]);
        user.materias = materiasRows; // Array de { id, name }
    } catch (e) {
        console.error("Error obteniendo materias (puede no existir tabla):", e.message);
        user.materias = [];
    }

    // Aquí iría el query para traer las tutorías desde la tabla Mentorships
    // Por el momento se maneja en base a mocks abajo
    return user;
};

const enrichUserProfileData = (user) => {
    return {
        ...user,
        score: DEFAULT_SCORE,
        badges: DEFAULT_BADGES,
        tutorias: DEFAULT_TUTORIAS
    };
};