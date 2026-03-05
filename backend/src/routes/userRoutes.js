import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import upload from '../middleware/upload.js'; // Middleware para procesar la imagen

const router = express.Router();

// Obtener perfil (RF#005)
router.get('/profile/:id', getUserProfile);

// Actualizar perfil (RF#003) - Se usa upload.single para la imagen de perfil lo cual si se cumple
router.put('/profile/:id', upload.single('foto_perfil'), updateUserProfile);

export default router;