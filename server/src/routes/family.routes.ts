import { Router } from 'express';
import { body } from 'express-validator';
import { familyController } from '../controllers/family.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.get('/', authenticate, familyController.getUserFamilies);

router.get('/all', authenticate, familyController.getAll);

router.get('/public', familyController.getPublic);

router.post(
  '/',
  authenticate,
  validate([
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('rootPersonName').optional().trim(),
  ]),
  familyController.create
);

router.get('/:id', optionalAuth, familyController.getById);

router.patch(
  '/:id',
  authenticate,
  validate([
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
  ]),
  familyController.update
);

router.delete('/:id', authenticate, familyController.delete);

router.post('/:id/join', authenticate, familyController.joinRequest);

router.patch('/:id/approve', authenticate, familyController.approveMember);

router.patch('/:id/leave', authenticate, familyController.leave);

router.get('/:id/pending-members', authenticate, familyController.getPendingMembers);

router.patch('/:id/approve-member', authenticate, familyController.approveMember);

router.patch('/:id/reject-member', authenticate, familyController.rejectMember);

export default router;
