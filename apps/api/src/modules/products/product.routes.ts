import { Router } from 'express';
import { getProducts, getProduct, getCategories } from './product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

export default router;
