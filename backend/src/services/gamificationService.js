import redis from '../config/redis.js';

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