import { Router } from 'express';
import { getBlogPosts, getBlogPost, getPage, getCarousel } from './content.controller';

const router = Router();

router.get('/blog/posts', getBlogPosts);
router.get('/blog/posts/:slug', getBlogPost);
router.get('/pages/:slug', getPage);
router.get('/carousel', getCarousel);

export default router;
