// import { Router, Response } from 'express';
// import { z } from 'zod';
// // import prisma from '../../config/db';
// // import { requireAuth, AuthenticatedRequest } from '../../middlewares/auth.middleware';
// // Replace lines 3 and 4 with:
// import prisma from '../config/db';
// import { requireAuth } from '../middlewares/auth.middleware'; // or whatever auth helper is exported
// const router = Router();

// const createOrderSchema = z.object({
//   deliverySlot: z.enum(['BATCH_6AM', 'BATCH_12PM']).default('BATCH_6AM'),
//   items: z.array(
//     z.object({
//       productId: z.string().uuid(),
//       quantity: z.number().int().positive(),
//       selectedUnit: z.enum([
//         'CARTON',
//         'HALF_CARTON',
//         'DOZEN',
//         'PACK',
//         'KG',
//         'QUINTAL',
//         'MEREB',
//         'PIECE',
//       ]).default('CARTON'),
//       unitPrice: z.number().positive(),
//     })
//   ).min(1, 'ቢያንስ አንድ እቃ መምረጥ አለብዎት'),
// });

// // POST /api/orders
// router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { items, deliverySlot } = createOrderSchema.parse(req.body);
//     const userId = req.user!.userId;

//     const totalAmount = items.reduce(
//       (sum, item) => sum + item.quantity * item.unitPrice,
//       0
//     );

//     const order = await prisma.order.create({
//       data: {
//         userId,
//         totalAmount,
//         deliverySlot,
//         items: {
//           create: items.map((i) => ({
//             productId: i.productId,
//             quantity: i.quantity,
//             selectedUnit: i.selectedUnit,
//             unitPrice: i.unitPrice,
//           })),
//         },
//       },
//       include: {
//         items: {
//           include: { product: true },
//         },
//       },
//     });

//     return res.status(201).json({ success: true, order });
//   } catch (err: any) {
//     console.error('Order error:', err);
//     return res.status(400).json({
//       error: err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
//     });
//   }
// });

// // GET /api/orders
// router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const orders = await prisma.order.findMany({
//       where: { userId: req.user!.userId },
//       include: {
//         items: {
//           include: { product: true },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//     return res.status(200).json(orders);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'ትእዛዞችን ማግኘት አልተቻለም' });
//   }
// });

// export default router;
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { requireAuth } from '../middlewares/auth.middleware';

// Local interface extending Express Request to fix TS2304 cleanly
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phoneNumber?: string;
    role?: string;
    [key: string]: any;
  };
}

const router = Router();

const createOrderSchema = z.object({
  deliverySlot: z.enum(['BATCH_6AM', 'BATCH_12PM']).default('BATCH_6AM'),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      selectedUnit: z.enum([
        'CARTON',
        'HALF_CARTON',
        'DOZEN',
        'PACK',
        'KG',
        'QUINTAL',
        'MEREB',
        'PIECE',
      ]).default('CARTON'),
      unitPrice: z.number().positive(),
    })
  ).min(1, 'ቢያንስ አንድ እቃ መምረጥ አለብዎት'),
});

// POST /api/orders
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, deliverySlot } = createOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        deliverySlot,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedUnit: i.selectedUnit,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    console.error('Order error:', err);
    return res.status(400).json({
      error: err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
    });
  }
});

// GET /api/orders
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ትእዛዞችን ማግኘት አልተቻለም' });
  }
});

export default router;