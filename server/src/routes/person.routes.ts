import { Router } from 'express';
import { body } from 'express-validator';
import { personController } from '../controllers/person.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.get(
  '/search',
  optionalAuth,
  personController.search
);

router.post(
  '/',
  authenticate,
  validate([
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('familyId').isUUID(),
    body('dateOfBirth').optional().isISO8601(),
    body('dateOfDeath').optional().isISO8601(),
    body('profileImageUrl').optional().isURL(),
  ]),
  personController.create
);

router.get('/:id', optionalAuth, personController.getById);

router.get('/:id/tree', optionalAuth, personController.getFamilyTree);

router.patch(
  '/:id',
  authenticate,
  validate([
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('dateOfBirth').optional({ nullable: true }).isISO8601(),
    body('dateOfDeath').optional({ nullable: true }).isISO8601(),
    body('profileImageUrl').optional({ nullable: true }).isURL(),
  ]),
  personController.update
);

router.delete('/:id', authenticate, personController.delete);

export default router;
