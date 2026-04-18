import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { notificationController } from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, notificationController.getAll);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.delete);

export default router;