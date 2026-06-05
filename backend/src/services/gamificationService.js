import db from '../config/db.js';
import redis from '../config/redis.js';

// Parámetros de recompensa (ajustables)
const COINS_FOR_COMPLETION = 50;
const XP_FOR_COMPLETION = 100;
const DEFAULT_BADGE = { id: 'mentor_first_completion', title: 'Tutor Comprometido' };

export const ensureTableExists = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS Gamification (
            user_id INT PRIMARY KEY,
            espe_coins INT DEFAULT 0,
            xp INT DEFAULT 0,
            level INT DEFAULT 1,
            badges TEXT DEFAULT '[]'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
};

export const awardCompletionToMentor = async (mentorshipId) => {
    try {
        const [mRows] = await db.query('SELECT mentor_id FROM Mentorships WHERE id = ? AND is_deleted = 0', [mentorshipId]);
        if (mRows.length === 0) return null;
        const mentorId = mRows[0].mentor_id;

        await ensureTableExists();

        // Asegurar fila
        await db.query(
            'INSERT INTO Gamification (user_id, espe_coins, xp, badges) SELECT ?, 0, 0, ? WHERE NOT EXISTS (SELECT 1 FROM Gamification WHERE user_id = ?)',
            [mentorId, '[]', mentorId]
        );

        // Actualizar monedas y XP
        await db.query('UPDATE Gamification SET espe_coins = espe_coins + ?, xp = xp + ? WHERE user_id = ?', [COINS_FOR_COMPLETION, XP_FOR_COMPLETION, mentorId]);

        // Añadir insignia si no existe
        const [gRows] = await db.query('SELECT badges FROM Gamification WHERE user_id = ?', [mentorId]);
        if (gRows.length > 0) {
            let badges = [];
            try { badges = JSON.parse(gRows[0].badges || '[]'); } catch (e) { badges = []; }
            const exists = badges.find(b => b.id === DEFAULT_BADGE.id);
            if (!exists) {
                badges.push(DEFAULT_BADGE);
                await db.query('UPDATE Gamification SET badges = ? WHERE user_id = ?', [JSON.stringify(badges), mentorId]);
            }
        }

        return { user_id: mentorId };
    } catch (err) {
        console.error('gamificationService.awardCompletionToMentor error:', err.message);
        throw err;
    }
};

export const getGamificationByUser = async (userId) => {
    try {
        await ensureTableExists();
        const [rows] = await db.query('SELECT espe_coins, xp, level, badges FROM Gamification WHERE user_id = ?', [userId]);
        if (rows.length === 0) return { espe_coins: 0, xp: 0, level: 1, badges: [] };
        const row = rows[0];
        let badges = [];
        try { badges = JSON.parse(row.badges || '[]'); } catch (e) { badges = []; }
        return {
            espe_coins: Number(row.espe_coins) || 0,
            xp: Number(row.xp) || 0,
            level: Number(row.level) || 1,
            badges
        };
    } catch (err) {
        console.error('gamificationService.getGamificationByUser error:', err.message);
        return { espe_coins: 0, xp: 0, level: 1, badges: [] };
    }
};

export default {
    ensureTableExists,
    awardCompletionToMentor,
    getGamificationByUser
};

// 1. Sumar puntos a un mentor (ej. al completar una sesión [cite: 28])
export const updateMentorScore = async (mentorId, points) => {
    // ZINCRBY aumenta el puntaje del mentor en el ranking "mentor_ranking"
    await redis.zincrby('mentor_ranking', points, mentorId);
};

// 2. Obtener el Top 10 de mentores para el Leaderboard 
export const getTopMentors = async () => {
    // ZREVRANGE obtiene los miembros con los puntajes más altos
    const top = await redis.zrevrange('mentor_ranking', 0, 9, 'WITHSCORES');
    return top; 
};