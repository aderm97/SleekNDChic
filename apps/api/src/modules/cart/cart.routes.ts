import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from './cart.controller';

const router = Router();

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:variantId', updateCartItem);
router.delete('/items/:variantId', removeFromCart);

export default router;
