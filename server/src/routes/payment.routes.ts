import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { paymentController } from '../controllers/payment.controller.js';

const router = Router();

router.post('/stkpush', authenticate, paymentController.initiateSTKPush);
router.get('/family/:familyId', authenticate, paymentController.getFamilyPayments);

export default router;