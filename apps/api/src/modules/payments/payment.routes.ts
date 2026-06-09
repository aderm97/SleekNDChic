import { Router } from 'express';
import { initializePayment, verifyPayment, paystackWebhook } from './payment.controller';

const router = Router();

router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);
router.post('/webhook', paystackWebhook);

export default router;
