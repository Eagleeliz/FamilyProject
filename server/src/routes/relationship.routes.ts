import { Router } from 'express';
import { body } from 'express-validator';
import { relationshipController } from '../controllers/relationship.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validate([
    body('personId').isUUID(),
    body('relatedPersonId').isUUID(),
    body('relationshipType').isIn(['parent', 'child', 'sibling', 'spouse']),
  ]),
  relationshipController.create
);

router.delete('/:id', authenticate, relationshipController.delete);

router.get('/person/:id/relatives', authenticate, relationshipController.getRelatives);

router.get('/person/:id/cousins', authenticate, relationshipController.getCousins);

export default router;
