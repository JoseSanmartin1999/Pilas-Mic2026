import app from './app.js';
import dotenv from 'dotenv';
import http from 'http'; // 1. Importamos el módulo http nativo
import { Server } from 'socket.io'; // 2. Importamos Socket.io
import ChatMessage from './models/ChatMessage.js';

// Importamos conexiones a DBs
import db from './config/db.js'; // TiDB/MySQL
import connectMongo from './config/mongo.js'; // Tu nueva conexión a MongoDB

dotenv.config();

const PORT = process.env.PORT || 3000;

// 3. Conectamos a MongoDB antes de levantar el servidor
connectMongo();

// 4. Creamos el servidor HTTP envolviendo tu app de Express
const server = http.createServer(app);

// 5. Inicializamos Socket.io sobre ese servidor
const io = new Server(server, {
    cors: {
        origin: '*', // En desarrollo permitimos todo. En prod, pon la URL de tu frontend.
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`🟢 Usuario conectado al chat: ${socket.id}`);

    socket.on('join_mentorship_room', (mentorshipId) => {
        socket.join(`room_${mentorshipId}`);
        console.log(`Usuario se unió a la sala de tutoría: ${mentorshipId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            // 1. Guardamos el mensaje en MongoDB
            const newMessage = await ChatMessage.create({
                mentorship_id: data.mentorshipId,
                sender_id: data.senderId,
                message: data.message
            });

            // 2. Retransmitimos el mensaje (ahora con la fecha y ID de Mongo) a la sala
            io.to(`room_${data.mentorshipId}`).emit('receive_message', newMessage);
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Usuario desconectado: ${socket.id}`);
    });
});

// 7. IMPORTANTE: Cambiamos app.listen por server.listen
server.listen(PORT, () => {
    console.log(`🚀 Servidor backend y WebSockets corriendo en puerto ${PORT}`);
});