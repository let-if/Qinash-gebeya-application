
// import { Router, Request, Response } from 'express';
// import { CatalogService } from './catalog.service';
// import prisma from '../../config/db';

// const router = Router();

// // Helper to format products so the mobile app only sees the posted stock count
// function mapToPublicProduct(product: any) {
//   if (!product) return null;
//   const p = { ...product };
//   // The mobile app displays currentStock, which reflects postedStock
//   p.currentStock = p.postedStock !== undefined ? p.postedStock : (p.currentStock ?? p.actualStock ?? 50);
//   return p;
// }

// // GET /api/catalog/ads (Active dynamic image & video banners including 3-slot media arrays)
// router.get('/ads', async (_req, res: Response): Promise => {
//   try {
//     const ads = await prisma.banner.findMany({
//       where: { isActive: true },
//       orderBy: { displayOrder: 'asc' },
//       select: {
//         id: true,
//         title: true,
//         mediaType: true,
//         mediaUrl: true,
//         mediaUrls: true,    // <-- Exposes all 3 video/image links
//         mediaTypes: true,   // <-- Exposes array of VIDEO / IMAGE types
//         actionLink: true,
//         displayOrder: true,
//         isActive: true,
//       },
//     });

//     return res.status(200).json({ ads });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'Failed to load advertisements' });
//   }
// });

// // GET /api/catalog/post-order-ad (Active 3-second skippable ad for post-order popup)
// router.get('/post-order-ad', async (_req, res: Response): Promise => {
//   try {
//     const ad = await prisma.interstitialAd.findFirst({
//       where: { isActive: true },
//       orderBy: { createdAt: 'desc' },
//     });

//     return res.status(200).json({ ad: ad || null });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'ማስታወቂያውን ማግኘት አልተቻለም' });
//   }
// });

// // GET /api/catalog/categories
// router.get('/categories', async (_req, res: Response): Promise => {
//   try {
//     const categories = await CatalogService.listCategories();
//     return res.status(200).json({ categories });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'Failed to load categories' });
//   }
// });

// // GET /api/catalog/products (Supports categoryId and fastMoving filters)
// router.get('/products', async (req: Request, res: Response): Promise => {
//   try {
//     const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
//     const fastMoving = req.query.fastMoving === 'true';
//     const rawProducts = await CatalogService.listProducts({ categoryId, fastMoving });

//     // Map each product so the mobile frontend receives the posted stock count
//     const products = Array.isArray(rawProducts)
//       ? rawProducts.map(mapToPublicProduct)
//       : rawProducts;

//     return res.status(200).json({ products });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'Failed to load products' });
//   }
// });

// // GET /api/catalog/products/:id (Single product detail)
// router.get('/products/:id', async (req: Request, res: Response): Promise => {
//   try {
//     const id = String(req.params.id);
//     const rawProduct = await CatalogService.getProductById(id);
//     if (!rawProduct) {
//       return res.status(404).json({ error: 'ምርቱ አልተገኘም' });
//     }

//     const product = mapToPublicProduct(rawProduct);
//     return res.status(200).json({ product });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'Failed to load product detail' });
//   }
// });

// // PATCH /api/catalog/products/:id (Quick inventory & price updates from Admin Portal)
// router.patch('/products/:id', async (req: Request, res: Response): Promise => {
//   try {
//     const id = String(req.params.id);
//     const {
//       actualStock,
//       postedStock,
//       currentStock,
//       pricePerUnit,
//       isActive,
//       allowsHalfCarton,
//       priceHalfCarton,
//       allowsHalfDozen,
//       priceHalfDozen,
//       allowsPacket,
//       pricePacket,
//     } = req.body;

//     const updatePayload: any = {
//       isActive,
//     };

//     if (pricePerUnit !== undefined) updatePayload.pricePerUnit = Number(pricePerUnit);
//     if (actualStock !== undefined) updatePayload.actualStock = Number(actualStock);
//     if (postedStock !== undefined) updatePayload.postedStock = Number(postedStock);
//     if (currentStock !== undefined) updatePayload.currentStock = Number(currentStock);
//     if (allowsHalfCarton !== undefined) updatePayload.allowsHalfCarton = Boolean(allowsHalfCarton);
//     if (priceHalfCarton !== undefined) updatePayload.priceHalfCarton = priceHalfCarton ? Number(priceHalfCarton) : null;
//     if (allowsHalfDozen !== undefined) updatePayload.allowsHalfDozen = Boolean(allowsHalfDozen);
//     if (priceHalfDozen !== undefined) updatePayload.priceHalfDozen = priceHalfDozen ? Number(priceHalfDozen) : null;
//     if (allowsPacket !== undefined) updatePayload.allowsPacket = Boolean(allowsPacket);
//     if (pricePacket !== undefined) updatePayload.pricePacket = pricePacket ? Number(pricePacket) : null;

//     const product = await CatalogService.updateProduct(id, updatePayload);
//     return res.status(200).json({ product, message: 'ምርቱ በተሳካ ሁኔታ ተስተካክሏል' });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ምርቱን ማስተካከል አልተቻለም' });
//   }
// });

// // ====================================================
// // DELETE /api/catalog/categories/:id (Safe Cascade Deletion)
// // ====================================================
// router.delete('/categories/:id', async (req: Request, res: Response): Promise => {
//   try {
//     const id = String(req.params.id);

//     const category = await prisma.category.findUnique({
//       where: { id },
//       include: {
//         products: {
//           select: { id: true },
//         },
//       },
//     });

//     if (!category) {
//       return res.status(404).json({ error: 'ምድቡ አልተገኘም (Category not found)' });
//     }

//     const productIds = category.products.map((p) => p.id);

//     // Check if any product in this category has ever been ordered
//     const orderItemsCount = await prisma.orderItem.count({
//       where: {
//         productId: { in: productIds },
//       },
//     });

//     if (orderItemsCount > 0) {
//       // Soft-delete to preserve historical orders & invoices
//       await prisma.$transaction([
//         prisma.product.updateMany({
//           where: { categoryId: id },
//           data: { isActive: false },
//         }),
//         prisma.category.update({
//           where: { id },
//           data: { isActive: false },
//         }),
//       ]);

//       return res.status(200).json({
//         success: true,
//         message: 'በዚህ ምድብ ውስጥ ያሉ ምርቶች ከዚህ ቀደም የታዘዙ በመሆናቸው ምድቡና ምርቶቹ ከገበያ ተሰውረዋል',
//       });
//     }

//     // Never ordered: safe to wipe category and products
//     await prisma.$transaction([
//       prisma.product.deleteMany({
//         where: { categoryId: id },
//       }),
//       prisma.category.delete({
//         where: { id },
//       }),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: 'ምድቡና በውስጡ ያሉ ምርቶች በሙሉ ተሰርዘዋል',
//     });
//   } catch (err: any) {
//     console.error('Delete category error:', err);
//     return res.status(500).json({ error: err.message || 'ምድቡን መሰረዝ አልተቻለም' });
//   }
// });

// // ====================================================
// // DELETE /api/catalog/products/:id (Safe Soft/Hard Delete)
// // ====================================================
// router.delete('/products/:id', async (req: Request, res: Response): Promise => {
//   try {
//     const id = String(req.params.id);

//     const existing = await prisma.product.findUnique({ where: { id } });
//     if (!existing) {
//       return res.status(404).json({ error: 'ምርቱ አልተገኘም (Product not found)' });
//     }

//     const orderItemCount = await prisma.orderItem.count({
//       where: { productId: id },
//     });

//     if (orderItemCount > 0) {
//       // Prevent foreign key constraint violation on order_items
//       const updated = await prisma.product.update({
//         where: { id },
//         data: { isActive: false },
//       });
//       return res.status(200).json({
//         success: true,
//         message: 'ምርቱ ከዚህ ቀደም የታዘዘ በመሆኑ ከገበያ ተሰውሯል',
//         product: updated,
//       });
//     }

//     // If never ordered, safely delete completely
//     await prisma.product.delete({ where: { id } });
//     return res.status(200).json({ success: true, message: 'ምርቱ ሙሉ በሙሉ ተሰርዟል' });
//   } catch (err: any) {
//     console.error('Delete product error:', err);
//     return res.status(500).json({ error: err.message || 'ምርቱን መሰረዝ አልተቻለም' });
//   }
// });

// export default router;
import { Router, Request, Response } from 'express';
import { CatalogService } from './catalog.service';
import prisma from '../../config/db';

const router = Router();

// Helper to format products so the mobile app only sees the posted stock count
function mapToPublicProduct(product: any) {
  if (!product) return null;
  const p = { ...product };
  // The mobile app displays currentStock, which reflects postedStock
  p.currentStock = p.postedStock !== undefined ? p.postedStock : (p.currentStock ?? p.actualStock ?? 50);
  return p;
}

// GET /api/catalog/ads (Active dynamic image & video banners including 3-slot media arrays)
router.get('/ads', async (_req, res: Response) => {
  try {
    const ads = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        title: true,
        mediaType: true,
        mediaUrl: true,
        mediaUrls: true,    // <-- Exposes all 3 video/image links
        mediaTypes: true,   // <-- Exposes array of VIDEO / IMAGE types
        actionLink: true,
        displayOrder: true,
        isActive: true,
      },
    });

    return res.status(200).json({ ads });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load advertisements' });
  }
});

// GET /api/catalog/post-order-ad (Active 3-second skippable ad for post-order popup)
router.get('/post-order-ad', async (_req, res: Response) => {
  try {
    const ad = await prisma.interstitialAd.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ ad: ad || null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ማስታወቂያውን ማግኘት አልተቻለም' });
  }
});

// GET /api/catalog/categories
router.get('/categories', async (_req, res: Response) => {
  try {
    const categories = await CatalogService.listCategories();
    return res.status(200).json({ categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load categories' });
  }
});

// GET /api/catalog/products (Supports categoryId and fastMoving filters)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const fastMoving = req.query.fastMoving === 'true';
    const rawProducts = await CatalogService.listProducts({ categoryId, fastMoving });

    // Map each product so the mobile frontend receives the posted stock count
    const products = Array.isArray(rawProducts)
      ? rawProducts.map(mapToPublicProduct)
      : rawProducts;

    return res.status(200).json({ products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load products' });
  }
});

// GET /api/catalog/products/:id (Single product detail)
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const rawProduct = await CatalogService.getProductById(id);
    if (!rawProduct) {
      return res.status(404).json({ error: 'ምርቱ አልተገኘም' });
    }

    const product = mapToPublicProduct(rawProduct);
    return res.status(200).json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load product detail' });
  }
});

// PATCH /api/catalog/products/:id (Quick inventory & price updates from Admin Portal)
router.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      actualStock,
      postedStock,
      currentStock,
      pricePerUnit,
      isActive,
      allowsHalfCarton,
      priceHalfCarton,
      allowsHalfDozen,
      priceHalfDozen,
      allowsPacket,
      pricePacket,
    } = req.body;

    const updatePayload: any = {
      isActive,
    };

    if (pricePerUnit !== undefined) updatePayload.pricePerUnit = Number(pricePerUnit);
    if (actualStock !== undefined) updatePayload.actualStock = Number(actualStock);
    if (postedStock !== undefined) updatePayload.postedStock = Number(postedStock);
    if (currentStock !== undefined) updatePayload.currentStock = Number(currentStock);
    if (allowsHalfCarton !== undefined) updatePayload.allowsHalfCarton = Boolean(allowsHalfCarton);
    if (priceHalfCarton !== undefined) updatePayload.priceHalfCarton = priceHalfCarton ? Number(priceHalfCarton) : null;
    if (allowsHalfDozen !== undefined) updatePayload.allowsHalfDozen = Boolean(allowsHalfDozen);
    if (priceHalfDozen !== undefined) updatePayload.priceHalfDozen = priceHalfDozen ? Number(priceHalfDozen) : null;
    if (allowsPacket !== undefined) updatePayload.allowsPacket = Boolean(allowsPacket);
    if (pricePacket !== undefined) updatePayload.pricePacket = pricePacket ? Number(pricePacket) : null;

    const product = await CatalogService.updateProduct(id, updatePayload);
    return res.status(200).json({ product, message: 'ምርቱ በተሳካ ሁኔታ ተስተካክሏል' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ምርቱን ማስተካከል አልተቻለም' });
  }
});

// ====================================================
// DELETE /api/catalog/categories/:id (Safe Cascade Deletion)
// ====================================================
router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'ምድቡ አልተገኘም (Category not found)' });
    }

    const productIds = category.products.map((p) => p.id);

    // Check if any product in this category has ever been ordered
    const orderItemsCount = await prisma.orderItem.count({
      where: {
        productId: { in: productIds },
      },
    });

    if (orderItemsCount > 0) {
      // Soft-delete to preserve historical orders & invoices
      await prisma.$transaction([
        prisma.product.updateMany({
          where: { categoryId: id },
          data: { isActive: false },
        }),
        prisma.category.update({
          where: { id },
          data: { isActive: false },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'በዚህ ምድብ ውስጥ ያሉ ምርቶች ከዚህ ቀደም የታዘዙ በመሆናቸው ምድቡና ምርቶቹ ከገበያ ተሰውረዋል',
      });
    }

    // Never ordered: safe to wipe category and products
    await prisma.$transaction([
      prisma.product.deleteMany({
        where: { categoryId: id },
      }),
      prisma.category.delete({
        where: { id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'ምድቡና በውስጡ ያሉ ምርቶች በሙሉ ተሰርዘዋል',
    });
  } catch (err: any) {
    console.error('Delete category error:', err);
    return res.status(500).json({ error: err.message || 'ምድቡን መሰረዝ አልተቻለም' });
  }
});

// ====================================================
// DELETE /api/catalog/products/:id (Safe Soft/Hard Delete)
// ====================================================
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'ምርቱ አልተገኘም (Product not found)' });
    }

    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      // Prevent foreign key constraint violation on order_items
      const updated = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return res.status(200).json({
        success: true,
        message: 'ምርቱ ከዚህ ቀደም የታዘዘ በመሆኑ ከገበያ ተሰውሯል',
        product: updated,
      });
    }

    // If never ordered, safely delete completely
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'ምርቱ ሙሉ በሙሉ ተሰርዟል' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: err.message || 'ምርቱን መሰረዝ አልተቻለም' });
  }
});

export default router;