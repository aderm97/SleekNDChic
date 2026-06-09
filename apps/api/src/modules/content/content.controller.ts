import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { AppError } from '@/shared/middleware/errorHandler';

export async function getBlogPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        active: true,
        publishedAt: { not: null, lte: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
    });

    res.json({ data: posts });
  } catch (error) {
    next(error);
  }
}

export async function getBlogPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.active || !post.publishedAt || post.publishedAt > new Date()) {
      throw new AppError(404, 'NOT_FOUND', 'Blog post not found');
    }

    res.json({ data: post });
  } catch (error) {
    next(error);
  }
}

export async function getPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const page = await prisma.page.findUnique({
      where: { slug, active: true },
    });

    if (!page) {
      throw new AppError(404, 'NOT_FOUND', 'Page not found');
    }

    res.json({ data: page });
  } catch (error) {
    next(error);
  }
}

export async function getCarousel(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.carouselItem.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
}
