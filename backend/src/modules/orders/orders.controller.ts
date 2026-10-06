
// import { Router, Request, Response } from 'express';
// import { z } from 'zod';
// import prisma from '../../config/db';
// import { requireAuth } from '../../middlewares/auth.middleware';

// // Extended request interface ensuring role and properties are properly typed
// export interface AuthenticatedRequest extends Request {
//   user?: {
//     userId: string;
//     phoneNumber?: string;
//     role?: string;
//     [key: string]: any;
//   };
// }

// const router = Router();

// // Robust Unit Normalizer supporting all 4 pricing tiers in English & Amharic
// const unitEnum = z.preprocess((val) => {
//   if (typeof val !== 'string') return val;
//   const s = val.trim();
//   if (s === 'PACKET' || s === 'ፓኬት') return 'PACK';
//   if (s === 'ካርቶን') return 'CARTON';
//   if (s === 'ግማሽ ካርቶን' || s === 'ግማሽ') return 'HALF_CARTON';
//   if (s === 'ግማሽ ደርዘን') return 'HALF_DOZEN';
//   if (s === 'ደርዘን') return 'DOZEN';
//   if (s === 'ኪሎ') return 'KG';
//   if (s === 'ኩንታል') return 'QUINTAL';
//   if (s === 'ቁራጭ') return 'PIECE';
//   if (s === 'መረብ') return 'MEREB';
//   return s.toUpperCase();
// }, z.enum([
//   'CARTON',
//   'HALF_CARTON',
//   'DOZEN',
//   'HALF_DOZEN',
//   'PACK',
//   'KG',
//   'QUINTAL',
//   'MEREB',
//   'PIECE',
// ]));

// const createOrderSchema = z.object({
//   deliverySlot: z.enum(['BATCH_6AM', 'BATCH_12PM']).default('BATCH_6AM'),
//   isCreditOrder: z.boolean().default(false),
//   items: z.array(
//     z.object({
//       productId: z.string(),
//       quantity: z.number().int().positive('ብዛት ከ 0 መብለጥ አለበት'),
//       selectedUnit: unitEnum.default('CARTON'),
//       unitPrice: z.number().optional(), // Made optional for self-healing lookup
//     })
//   ).min(1, 'ቢያንስ አንድ እቃ መመረጥ አለበት'),
// });

// // Helper to determine accurate unit price from Product schema
// function resolveProductUnitPrice(product: any, selectedUnit: string): number {
//   const base = Number(product.pricePerUnit || 0);
//   switch (selectedUnit) {
//     case 'HALF_CARTON':
//       return product.priceHalfCarton !== null && product.priceHalfCarton !== undefined
//         ? Number(product.priceHalfCarton)
//         : Math.round(base * 0.52);
//     case 'HALF_DOZEN':
//       return product.priceHalfDozen !== null && product.priceHalfDozen !== undefined
//         ? Number(product.priceHalfDozen)
//         : Math.round(base * 0.5);
//     case 'PACK':
//       return product.pricePacket !== null && product.pricePacket !== undefined
//         ? Number(product.pricePacket)
//         : Math.round((base / 12) * 1.08);
//     case 'DOZEN':
//     case 'CARTON':
//     default:
//       return base;
//   }
// }

// // ----------------------------------------------------
// // 1. CREATE ORDER (Supports 1-Tap Reorder, Cash & Credit)
// // ----------------------------------------------------
// router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const { items, deliverySlot, isCreditOrder } = createOrderSchema.parse(req.body);
//     const userId = req.user!.userId;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'ተጠቃሚው አልተገኘም' });
//     }

//     // Resolve accurate unit prices & verify existence of all products
//     const productIds = items.map((i) => i.productId);
//     const dbProducts = await prisma.product.findMany({
//       where: { id: { in: productIds } },
//     });

//     const productMap = new Map(dbProducts.map((p) => [p.id, p]));

//     let calculatedTotal = 0;
//     const validatedItems = items.map((i) => {
//       const dbProd = productMap.get(i.productId);
//       if (!dbProd) {
//         throw new Error(`የተመረጠው እቃ አልተገኘም: ${i.productId}`);
//       }
//       const actualUnitPrice = i.unitPrice !== undefined && i.unitPrice > 0
//         ? Number(i.unitPrice)
//         : resolveProductUnitPrice(dbProd, i.selectedUnit as string);

//       calculatedTotal += i.quantity * actualUnitPrice;

//       return {
//         productId: i.productId,
//         quantity: i.quantity,
//         selectedUnit: i.selectedUnit as any,
//         unitPrice: actualUnitPrice,
//       };
//     });

//     // Check credit limits if requested on credit
//     if (isCreditOrder) {
//       const remainingCredit = Number(user.creditLimit) - Number(user.usedCredit);
//       if (calculatedTotal > remainingCredit) {
//         return res.status(400).json({
//           error: `የብድር ጣሪያዎ በቂ አይደለም። የቀረዎት ብድር: ${remainingCredit.toLocaleString()} ብር ብቻ ነው`,
//         });
//       }
//     }

//     const order = await prisma.$transaction(async (tx) => {
//       const createdOrder = await tx.order.create({
//         data: {
//           userId,
//           totalAmount: calculatedTotal,
//           deliverySlot,
//           status: 'PENDING',
//           isCreditOrder,
//           creditApproved: isCreditOrder ? null : null,
//           isCreditSettled: false,
//           items: {
//             create: validatedItems,
//           },
//         },
//         include: {
//           items: {
//             include: { product: true },
//           },
//         },
//       });

//       // Synchronously deduct dual inventory based on tier proportions
//       for (const item of validatedItems) {
//         let decrementCount = item.quantity;
//         if (item.selectedUnit === 'HALF_CARTON' || item.selectedUnit === 'HALF_DOZEN') {
//           decrementCount = Math.max(1, Math.ceil(item.quantity * 0.5));
//         } else if (item.selectedUnit === 'PACK') {
//           decrementCount = Math.max(1, Math.ceil(item.quantity * 0.1));
//         }

//         const product = await tx.product.findUnique({
//           where: { id: item.productId },
//         });

//         if (product) {
//           const updateData: any = {};
//           if ('actualStock' in product) {
//             updateData.actualStock = { decrement: decrementCount };
//           }
//           if ('postedStock' in product) {
//             updateData.postedStock = { decrement: decrementCount };
//           }
//           if ('currentStock' in product) {
//             updateData.currentStock = { decrement: decrementCount };
//           }

//           await tx.product.update({
//             where: { id: item.productId },
//             data: updateData,
//           });
//         }
//       }

//       return createdOrder;
//     });

//     return res.status(201).json({ success: true, order });
//   } catch (err: any) {
//     console.error('Order creation error:', err);
//     return res.status(400).json({
//       error: err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
//     });
//   }
// });

// // ----------------------------------------------------
// // 2. GET MY ORDERS (Returns Latest Orders for 1-Tap Reorder & History)
// // ----------------------------------------------------
// router.get('/my-orders', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const orders = await prisma.order.findMany({
//       where: { 
//         userId: req.user!.userId,
//       },
//       include: {
//         items: {
//           include: { product: true },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//     return res.status(200).json({ orders });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'ትእዛዞችን ማግኘት አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 3. GET CREDIT REQUESTS (Mobile "ሂሳብ" Tab & Admin Credit Dashboard)
// // ----------------------------------------------------
// router.get('/credit-requests', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const userRole = req.user?.role;
//     const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

//     const creditOrders = await prisma.order.findMany({
//       where: {
//         isCreditOrder: true,
//         ...(isAdmin ? {} : { userId: req.user!.userId }),
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             phoneNumber: true,
//             shopName: true,
//             creditLimit: true,
//             usedCredit: true,
//           },
//         },
//         items: {
//           include: { product: true },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return res.status(200).json({ creditOrders });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'የብድር መረጃዎችን ማግኘት አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 4. GET ALL ORDERS (Admin Portal Orders Tab)
// // ----------------------------------------------------
// router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const userRole = req.user?.role;
//     const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

//     const orders = await prisma.order.findMany({
//       where: isAdmin ? {} : { userId: req.user!.userId },
//       include: {
//         user: {
//           select: {
//             id: true,
//             phoneNumber: true,
//             shopName: true,
//           },
//         },
//         items: {
//           include: { product: true },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return res.status(200).json(isAdmin ? { orders } : orders);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'ትእዛዞችን ማግኘት አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 5. ADMIN: APPROVE / REJECT CREDIT ORDER
// // ----------------------------------------------------
// router.patch('/:id/approve-credit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const userRole = req.user?.role;
//     if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
//       return res.status(403).json({ error: 'የአስተዳዳሪ ፈቃድ ያስፈልጋል' });
//     }

//     const id = String(req.params.id);
//     const { approved } = req.body;

//     if (typeof approved !== 'boolean') {
//       return res.status(400).json({ error: 'የብድር ውሳኔ (approved: boolean) መገለጽ አለበት' });
//     }

//     const updated = await prisma.$transaction(async (tx) => {
//       const order = await tx.order.findUnique({
//         where: { id },
//         include: { items: true },
//       });

//       if (!order) {
//         throw new Error('ትእዛዙ አልተገኘም');
//       }

//       if (approved) {
//         await tx.user.update({
//           where: { id: order.userId },
//           data: {
//             usedCredit: { increment: order.totalAmount },
//           },
//         });

//         return await tx.order.update({
//           where: { id },
//           data: {
//             status: 'CONFIRMED',
//             creditApproved: true,
//           },
//           include: {
//             user: true,
//             items: { include: { product: true } },
//           },
//         });
//       } else {
//         // Return dual inventory on rejection
//         for (const item of (order.items as any[])) {
//           let restoreCount = item.quantity;
//           if (item.selectedUnit === 'HALF_CARTON' || item.selectedUnit === 'HALF_DOZEN') {
//             restoreCount = Math.max(1, Math.ceil(item.quantity * 0.5));
//           } else if (item.selectedUnit === 'PACK') {
//             restoreCount = Math.max(1, Math.ceil(item.quantity * 0.1));
//           }

//           const prod = await tx.product.findUnique({ where: { id: item.productId } });
//           if (prod) {
//             const restoreData: any = {};
//             if ('actualStock' in prod) restoreData.actualStock = { increment: restoreCount };
//             if ('postedStock' in prod) restoreData.postedStock = { increment: restoreCount };
//             if ('currentStock' in prod) restoreData.currentStock = { increment: restoreCount };

//             await tx.product.update({
//               where: { id: item.productId },
//               data: restoreData,
//             });
//           }
//         }

//         return await tx.order.update({
//           where: { id },
//           data: {
//             status: 'CANCELLED',
//             creditApproved: false,
//           },
//           include: {
//             user: true,
//             items: { include: { product: true } },
//           },
//         });
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: approved ? 'ብድሩ በተሳካ ሁኔታ ተፈቅዷል' : 'ብድሩ ውድቅ ተደርጎ እቃው ወደ መጋዘን ተመልሷል',
//       order: updated,
//     });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'የብድር ውሳኔውን ማስተናገድ አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 6. ADMIN: SETTLE CREDIT (MARK AS PAID)
// // ----------------------------------------------------
// router.patch('/:id/settle-credit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const userRole = req.user?.role;
//     if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
//       return res.status(403).json({ error: 'የአስተዳዳሪ ፈቃድ ያስፈልጋል' });
//     }

//     const id = String(req.params.id);

//     const order = await prisma.order.findUnique({
//       where: { id },
//       include: { user: true },
//     });

//     if (!order) {
//       return res.status(404).json({ error: 'ትእዛዙ አልተገኘም' });
//     }
//     if (!order.isCreditOrder) {
//       return res.status(400).json({ error: 'ይህ የብድር ትእዛዝ አይደለም' });
//     }
//     if (order.isCreditSettled) {
//       return res.status(400).json({ error: 'ይህ ብድር አስቀድሞ ተከፍሏል' });
//     }

//     const settled = await prisma.$transaction(async (tx) => {
//       await tx.user.update({
//         where: { id: order.userId },
//         data: {
//           usedCredit: { decrement: order.totalAmount },
//         },
//       });

//       return await tx.order.update({
//         where: { id },
//         data: {
//           isCreditSettled: true,
//           status: 'DELIVERED',
//         },
//         include: {
//           user: true,
//           items: { include: { product: true } },
//         },
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'የብድር ክፍያው ተረጋግጧል (Credit marked as paid)',
//       order: settled,
//     });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ክፍያውን ማስተናገድ አልተቻለም' });
//   }
// });

// // ----------------------------------------------------
// // 7. ADMIN: STANDARD ORDER STATUS LIFECYCLE
// // ----------------------------------------------------
// router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
//   try {
//     const userRole = req.user?.role;
//     if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
//       return res.status(403).json({ error: 'የአስተዳዳሪ ፈቃድ ያስፈልጋል' });
//     }

//     const id = String(req.params.id);
//     let { status } = req.body;

//     let targetStatus: any = status;
//     if (status === 'APPROVED') {
//       targetStatus = 'CONFIRMED';
//     }

//     const updated = await prisma.$transaction(async (tx) => {
//       const existing = await tx.order.findUnique({
//         where: { id },
//         include: { items: true },
//       });

//       if (!existing) {
//         throw new Error('ትእዛዙ አልተገኘም');
//       }

//       if (targetStatus === 'CANCELLED' && existing.status !== 'CANCELLED') {
//         for (const item of (existing.items as any[])) {
//           let restoreCount = item.quantity;
//           if (item.selectedUnit === 'HALF_CARTON' || item.selectedUnit === 'HALF_DOZEN') {
//             restoreCount = Math.max(1, Math.ceil(item.quantity * 0.5));
//           } else if (item.selectedUnit === 'PACK') {
//             restoreCount = Math.max(1, Math.ceil(item.quantity * 0.1));
//           }

//           const prod = await tx.product.findUnique({ where: { id: item.productId } });
//           if (prod) {
//             const restoreData: any = {};
//             if ('actualStock' in prod) restoreData.actualStock = { increment: restoreCount };
//             if ('postedStock' in prod) restoreData.postedStock = { increment: restoreCount };
//             if ('currentStock' in prod) restoreData.currentStock = { increment: restoreCount };

//             await tx.product.update({
//               where: { id: item.productId },
//               data: restoreData,
//             });
//           }
//         }
//       }

//       return await tx.order.update({
//         where: { id },
//         data: { status: targetStatus },
//         include: {
//           user: {
//             select: {
//               id: true,
//               phoneNumber: true,
//               shopName: true,
//             },
//           },
//           items: {
//             include: { product: true },
//           },
//         },
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'የትእዛዝ ሁኔታ ተቀይሯል',
//       order: updated,
//     });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ሁኔታውን መቀየር አልተቻለም' });
//   }
// });

// export default router;
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/db';
import { requireAuth } from '../../middlewares/auth.middleware';

// Extended request interface ensuring role and properties are properly typed
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phoneNumber?: string;
    role?: string;
    [key: string]: any;
  };
}

const router = Router();

// Robust Unit Normalizer supporting all 4 pricing tiers in English & Amharic
const unitEnum = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const s = val.trim();
  if (s === 'PACKET' || s === 'ፓኬት') return 'PACK';
  if (s === 'ካርቶን') return 'CARTON';
  if (s === 'ግማሽ ካርቶን' || s === 'ግማሽ') return 'HALF_CARTON';
  if (s === 'ግማሽ ደርዘን') return 'HALF_DOZEN';
  if (s === 'ደርዘን') return 'DOZEN';
  if (s === 'ኪሎ') return 'KG';
  if (s === 'ኩንታል') return 'QUINTAL';
  if (s === 'ቁራጭ') return 'PIECE';
  if (s === 'መረብ') return 'MEREB';
  return s.toUpperCase();
}, z.enum([
  'CARTON',
  'HALF_CARTON',
  'DOZEN',
  'HALF_DOZEN',
  'PACK',
  'KG',
  'QUINTAL',
  'MEREB',
  'PIECE',
]));

const createOrderSchema = z.object({
  deliverySlot: z.enum(['BATCH_6AM', 'BATCH_12PM']).default('BATCH_6AM'),
  isCreditOrder: z.boolean().default(false),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationName: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive('ብዛት ከ 0 መብለጥ አለበት'),
      selectedUnit: unitEnum.default('CARTON'),
      unitPrice: z.number().optional(), // Made optional for self-healing lookup
    })
  ).min(1, 'ቢያንስ አንድ እቃ መመረጥ አለበት'),
});

// Helper to determine accurate unit price from Product schema
function resolveProductUnitPrice(product: any, selectedUnit: string): number {
  const base = Number(product.pricePerUnit || 0);
  switch (selectedUnit) {
    case 'HALF_CARTON':
      return product.priceHalfCarton !== null && product.priceHalfCarton !== undefined
        ? Number(product.priceHalfCarton)
        : Math.round(base * 0.52);
    case 'HALF_DOZEN':
      return product.priceHalfDozen !== null && product.priceHalfDozen !== undefined
        ? Number(product.priceHalfDozen)
        : Math.round(base * 0.5);
    case 'PACK':
      return product.pricePacket !== null && product.pricePacket !== undefined
        ? Number(product.pricePacket)
        : Math.round((base / 12) * 1.08);
    case 'DOZEN':
    case 'CARTON':
    default:
      return base;
  }
}

// ----------------------------------------------------
// 1. CREATE ORDER (Supports 1-Tap Reorder, Cash, Credit & GPS Location)
// ----------------------------------------------------
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const { items, deliverySlot, isCreditOrder, latitude, longitude, locationName } =
      createOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'ተጠቃሚው አልተገኘም' });
    }

    // Verify whether the retailer is permitted by Admin to place orders on credit
    if (isCreditOrder && !user.canOrderOnCredit) {
      return res.status(403).json({
        error: 'ይቅርታ፤ ለመለያዎ የብድር አገልግሎት አልተፈቀደም። እባክዎ አስተዳዳሪውን ያነጋግሩ።',
      });
    }

    // Resolve accurate unit prices & verify existence of all products
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const validatedItems = items.map((i) => {
      const dbProd = productMap.get(i.productId);
      if (!dbProd) {
        throw new Error(`የተመረጠው እቃ አልተገኘም: ${i.productId}`);
      }
      const actualUnitPrice = i.unitPrice !== undefined && i.unitPrice > 0
        ? Number(i.unitPrice)
        : resolveProductUnitPrice(dbProd, i.selectedUnit as string);

      calculatedTotal += i.quantity * actualUnitPrice;

      return {
        productId: i.productId,
        quantity: i.quantity,
        selectedUnit: i.selectedUnit as any,
        unitPrice: actualUnitPrice,
      };
    });

    // Check credit limits if requested on credit
    if (isCreditOrder) {
      const remainingCredit = Number(user.creditLimit) - Number(user.usedCredit);
      if (calculatedTotal > remainingCredit) {
        return res.status(400).json({
          error: `የብድር ጣሪያዎ በቂ አይደለም። የቀረዎት ብድር: ${remainingCredit.toLocaleString()} ብር ብቻ ነው`,
        });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: calculatedTotal,
          deliverySlot,
          status: 'PENDING',
          isCreditOrder,
          creditApproved: isCreditOrder ? null : null,
          isCreditSettled: false,
          latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
          longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
          locationName: locationName || null,
          items: {
            create: validatedItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Synchronously deduct dual inventory based on tier proportions
      for (const item of validatedItems) {
        let decrementCount = item.quantity;
        if (item.selectedUnit === 'HALF_CARTON' || item.selectedUnit === 'HALF_DOZEN') {
          decrementCount = Math.max(1, Math.ceil(item.quantity * 0.5));
        } else if (item.selectedUnit === 'PACK') {
          decrementCount = Math.max(1, Math.ceil(item.quantity * 0.1));
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const updateData: any = {};
          if ('actualStock' in product) {
            updateData.actualStock = { decrement: decrementCount };
          }
          if ('postedStock' in product) {
            updateData.postedStock = { decrement: decrementCount };
          }
          if ('currentStock' in product) {
            updateData.currentStock = { decrement: decrementCount };
          }

          await tx.product.update({
            where: { id: item.productId },
            data: updateData,
          });
        }
      }

      return createdOrder;
    });

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return res.status(400).json({
      error: err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message || 'ትእዛዝ ማስተላለፍ አልተቻለም',
    });
  }
});

// ----------------------------------------------------
// 2. GET MY ORDERS (Returns Latest Orders for 1-Tap Reorder & History)
// ----------------------------------------------------
router.get('/my-orders', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const orders = await prisma.order.findMany({
      where: { 
        userId: req.user!.userId,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ትእዛዞችን ማግኘት አልተቻለም' });
  }
});

// ----------------------------------------------------
// 3. GET CREDIT REQUESTS (Includes GPS Coordinates for Admin)
// ----------------------------------------------------
router.get('/credit-requests', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const userRole = req.user?.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    const creditOrders = await prisma.order.findMany({
      where: {
        isCreditOrder: true,
        ...(isAdmin ? {} : { userId: req.user!.userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            shopName: true,
            creditLimit: true,
            usedCredit: true,
            canOrderOnCredit: true,
          },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ creditOrders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'የብድር መረጃዎችን ማግኘት አልተቻለም' });
  }
});

// ----------------------------------------------------
// 4. GET ALL ORDERS (Includes GPS Coordinates for Google Maps Button)
// ----------------------------------------------------
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const userRole = req.user?.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: req.user!.userId },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            shopName: true,
          },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(isAdmin ? { orders } : orders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ትእዛዞችን ማግኘት አልተቻለም' });
  }
});

// ----------------------------------------------------
// 5. ADMIN: APPROVE / REJECT CREDIT ORDER
// ----------------------------------------------------
router.patch('/:id/approve-credit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'የአስተዳዳሪ ፈቃድ ያስፈልጋል' });
    }

    const id = String(req.params.id);
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'የብድር ውሳኔ (approved: boolean) መገለጽ አለበት' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error('ትእዛዙ አልተገኘም');
      }

      if (approved) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            usedCredit: { increment: order.totalAmount },
          },
        });

        return await tx.order.update({
          where: { id },
          data: {
            status: 'CONFIRMED',
            creditApproved: true,
          },
          include: {
            user: true,
            items: { include: { product: true } },
          },
        });
      } else {
        // Return dual inventory on rejection
        for (const item of (order.items as any[])) {
          let restoreCount = item.quantity;
          if (item.selectedUnit === 'HALF_CARTON' || item.selectedUnit === 'HALF_DOZEN') {
            restoreCount = Math.max(1, Math.ceil(item.quantity * 0.5));
          } else if (item.selectedUnit === 'PACK') {
            restoreCount = Math.max(1, Math.ceil(item.quantity * 0.1));
          }

          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const restoreData: any = {};
            if ('actualStock' in prod) restoreData.actualStock = { increment: restoreCount };
            if ('postedStock' in prod) restoreData.postedStock = { increment: restoreCount };
            if ('currentStock' in prod) restoreData.currentStock = { increment: restoreCount };

            await tx.product.update({
              where: { id: item.productId },
              data: restoreData,
            });
          }
        }

        return await tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            creditApproved: false,
          },
          include: {
            user: true,
            items: { include: { product: true } },
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: approved ? 'ብድሩ በተሳካ ሁኔታ ተፈቅዷል' : 'ብድሩ ውድቅ ተደርጎ እቃው ወደ መጋዘን ተመልሷል',
      order: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'የብድር ውሳኔውን ማስተናገድ አልተቻለም' });
  }
});

// ----------------------------------------------------
// 6. ADMIN: SETTLE CREDIT (MARK AS PAID)
// ----------------------------------------------------
router.patch('/:id/settle-credit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'የአስተዳዳሪ ፈቃድ ያስፈልጋል' });
    }

    const id = String(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'ትእዛዙ አልተገኘም' });
    }
    if (!order.isCreditOrder) {
      return res.status(400).json({ error: 'ይህ የብድር ትእዛዝ አይደለም' });
    }
    if (order.isCreditSettled) {
      return res.status(400).json({ error: 'ይህ ብድር አስቀድሞ ተከፍሏል' });
    }

    const settled = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: order.userId },
        data: {
          usedCredit: { decrement: order.totalAmount },
        },
      });

      return await tx.order.update({
        where: { id },
        data: {
          isCreditSettled: true,
          status: 'DELIVERED',
        },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'የብድር ክፍያው ተረጋግጧል (Credit marked as paid)',
      order: settled,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ክፍያውን ማስተናገድ አልተቻለም' });
  }
});

// ----------------------------------------------------
// 7. ADMIN: STANDARD ORDER STATUS LIFECYCLE
// ----------------------------------------------------
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'የአስተዳዳሪ ፈቃድ ያስፈልጋል' });
    }

    const id = String(req.params.id);
    let { status } = req.body;

    let targetStatus: any = status;
    if (status === 'APPROVED') {
      targetStatus = 'CONFIRMED';
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error('ትእዛዙ አልተገኘም');
      }

      if (targetStatus === 'CANCELLED' && existing.status !== 'CANCELLED') {
        for (const item of (existing.items as any[])) {
          let restoreCount = item.quantity;
          if (item.selectedUnit === 'HALF_CARTON' || item.selectedUnit === 'HALF_DOZEN') {
            restoreCount = Math.max(1, Math.ceil(item.quantity * 0.5));
          } else if (item.selectedUnit === 'PACK') {
            restoreCount = Math.max(1, Math.ceil(item.quantity * 0.1));
          }

          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const restoreData: any = {};
            if ('actualStock' in prod) restoreData.actualStock = { increment: restoreCount };
            if ('postedStock' in prod) restoreData.postedStock = { increment: restoreCount };
            if ('currentStock' in prod) restoreData.currentStock = { increment: restoreCount };

            await tx.product.update({
              where: { id: item.productId },
              data: restoreData,
            });
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data: { status: targetStatus },
        include: {
          user: {
            select: {
              id: true,
              phoneNumber: true,
              shopName: true,
            },
          },
          items: {
            include: { product: true },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'የትእዛዝ ሁኔታ ተቀይሯል',
      order: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ሁኔታውን መቀየር አልተቻለም' });
  }
});

export default router;