import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUsersForSideBar, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send/:id', protectRoute , sendMessage);
router.get('/:id', protectRoute , getMessages);
router.get('/users/sidebar', protectRoute , getUsersForSideBar);

export default router;