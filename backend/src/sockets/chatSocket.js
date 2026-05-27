import { createMessage } from '../services/chatService.js';

const getRoomName = (mentorshipId) => `room_${mentorshipId}`;

export const registerChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`Usuario conectado al chat: ${socket.id}`);

        socket.on('join_mentorship_room', (mentorshipId) => {
            socket.join(getRoomName(mentorshipId));
            console.log(`Usuario se unio a la sala de tutoria: ${mentorshipId}`);
        });

        socket.on('send_message', async (data) => {
            try {
                const newMessage = await createMessage({
                    mentorshipId: data.mentorshipId,
                    senderId: data.senderId,
                    message: data.message
                });

                io.to(getRoomName(data.mentorshipId)).emit('receive_message', newMessage);
            } catch (error) {
                console.error('Error al guardar el mensaje:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Usuario desconectado: ${socket.id}`);
        });
    });
};
