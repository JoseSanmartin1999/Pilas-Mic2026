import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    const {
        full_name, email, password, role,
        institution = '',
        career = '',
        student_id = '',
        current_semester = 1,
        bio = null
    } = req.body;

    let { selectedSubjects = [] } = req.body;
    // Multipart form data envia arrays como strings, hay que parsearlos si vienen como string
    if (typeof selectedSubjects === 'string') {
        try {
            selectedSubjects = JSON.parse(selectedSubjects);
        } catch (e) {
            selectedSubjects = [selectedSubjects]; // fallback por si mandan "1" en lugar de "[1]"
        }
    }

    const profile_photo_url = req.file ? req.file.path : null;

    // Conexión para transacción (asegura que se guarde todo o nada)
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Encriptar contraseña (Seguridad RNF1)
        const password_hash = await bcrypt.hash(password, 10);

        // 2. Insertar Usuario en TiDB con los nuevos campos
        const [userResult] = await connection.query(
            `INSERT INTO Users (
                full_name, email, password_hash, role, 
                institution, career, student_id, current_semester, 
                bio, profile_photo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name, email, password_hash, role,
                institution, career, student_id, current_semester,
                bio, profile_photo_url
            ]
        );

        const userId = userResult.insertId;

        // 3. Si es Mentor, registrar las materias de la malla seleccionadas
        if (role === 'MENTOR' && selectedSubjects && selectedSubjects.length > 0) {
            const mentorSubjectsData = selectedSubjects.map(subjectId => [userId, subjectId]);
            await connection.query(
                'INSERT INTO Mentor_Subjects (mentor_id, subject_id) VALUES ?',
                [mentorSubjectsData]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Registro completado con éxito", userId });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error en el registro:", error);

        // Manejar explícitamente errores de claves duplicadas (email, student_id, etc.)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({
                message: "El correo electrónico o ID de estudiante ya se encuentra registrado."
            });
        }

        res.status(500).json({ message: "Error al registrar usuario", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Aquí idealmente generarías un token JWT. Por ahora retornamos el auth básico.
        res.json({
            message: "Login exitoso",
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
    }
};