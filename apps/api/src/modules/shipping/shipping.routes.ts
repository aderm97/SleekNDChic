import { Router } from 'express';
import { getShippingStates } from './shipping.controller';

const router = Router();

router.get('/states', getShippingStates);

export default router;
