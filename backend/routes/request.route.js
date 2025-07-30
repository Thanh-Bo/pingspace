import express from 'express';
import { acceptRequest, cancelRequest, getPendingRequests, getSentRequest, rejectRequest, sendRequest } from '../controllers/request.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', protectRoute , sendRequest);
router.post('/accept/:id', protectRoute , acceptRequest);
router.post('/cancel/:id', protectRoute , cancelRequest);
router.get('/pending', protectRoute , getPendingRequests);
router.get('/sent', protectRoute , getSentRequest);
router.delete('/reject/:id', protectRoute , rejectRequest);


export default router;