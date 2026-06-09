import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';

export async function getShippingStates(req: Request, res: Response, next: NextFunction) {
  try {
    const states = await prisma.stateShipping.findMany({
      where: { active: true },
      orderBy: { stateName: 'asc' },
    });

    // Group by state name
    const groupedStates = states.reduce((acc: any[], state) => {
      const existing = acc.find(s => s.state === state.stateName);
      if (existing) {
        existing.methods.push({
          method: state.shippingMethod,
          price: Number(state.price),
        });
      } else {
        acc.push({
          state: state.stateName,
          methods: [{
            method: state.shippingMethod,
            price: Number(state.price),
          }],
        });
      }
      return acc;
    }, []);

    res.json({ data: groupedStates });
  } catch (error) {
    next(error);
  }
}
