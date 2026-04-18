import { Router } from 'express';
import { body } from 'express-validator';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/analytics', adminController.getAnalytics);

router.get('/users', adminController.getUsers);

router.patch(
  '/users/:id/status',
  validate([body('status').isIn(['active', 'blocked'])]),
  adminController.updateUserStatus
);

router.patch(
  '/users/:id/role',
  validate([body('role').isIn(['user', 'admin'])]),
  adminController.updateUserRole
);

router.patch('/families/:id/approve', adminController.approveFamily);

router.patch('/families/:id/reject', adminController.rejectFamily);

router.patch('/persons/:id/approve', adminController.approvePerson);

router.patch('/persons/:id/reject', adminController.rejectPerson);

export default router;
