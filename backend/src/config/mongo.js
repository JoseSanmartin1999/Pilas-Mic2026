import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongo = async () => {
    try {
        // La URI vendrá de tus variables de entorno
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 Conectado exitosamente a MongoDB (Chat)');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectMongo;