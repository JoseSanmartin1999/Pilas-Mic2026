import express from 'express';
import { createMentorship, getMentorshipsByUser, updateMentorship, getNotificationCounts, markAsRead } from '../controllers/mentorshipController.js';

const router = express.Router();

// POST /api/mentorships
router.post('/', createMentorship);

// GET /api/mentorships/user/:userId
router.get('/user/:userId', getMentorshipsByUser);

// PUT /api/mentorships/:id
router.put('/:id', updateMentorship);

// GET /api/mentorships/counts/:userId
router.get('/counts/:userId', getNotificationCounts);

// PATCH /api/mentorships/:id/read
router.patch('/:id/read', markAsRead);

export default router;
