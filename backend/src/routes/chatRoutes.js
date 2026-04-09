import express from 'express';
import ChatMessage from '../models/ChatMessage.js'; // Importamos el modelo de Mongo

const router = express.Router();

// Endpoint para obtener el historial (GET /api/chat/:mentorshipId)
router.get('/:mentorshipId', async (req, res) => {
    try {
        const { mentorshipId } = req.params;
        
        // Buscamos los mensajes y los ordenamos por fecha de creación
        const history = await ChatMessage.find({ mentorship_id: mentorshipId })
                                         .sort({ createdAt: 1 });
        
        res.json(history);
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        res.status(500).json({ error: "Error al obtener el historial de chat" });
    }
});

export default router;