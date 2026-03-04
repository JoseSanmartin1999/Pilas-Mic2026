// backend/src/config/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// La URL la pegas en tu archivo .env como REDIS_URL
const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('✅ Conectado a Redis (Upstash) con éxito');
});

redis.on('error', (err) => {
    console.error('❌ Error en Redis:', err);
});

export default redis;