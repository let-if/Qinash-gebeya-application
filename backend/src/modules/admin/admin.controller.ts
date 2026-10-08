
// import { Router, Request, Response } from 'express';
// import multer from 'multer';
// import bcrypt from 'bcryptjs';
// import { v2 as cloudinary } from 'cloudinary';
// import { Readable } from 'stream';
// import prisma from '../../config/db';

// const router = Router();

// // ====================================================
// // Cloudinary Configuration
// // ====================================================
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'beahlrqy',
//   api_key: process.env.CLOUDINARY_API_KEY || '953418283816441',
//   api_secret: process.env.CLOUDINARY_API_SECRET || 'RJVVmv3OHuzQ05Zm_l4L_F6SwZo',
//   secure: true,
// });

// // Stream buffer directly to Cloudinary
// const uploadToCloudinary = (
//   buffer: Buffer,
//   folder: string = 'b2b-retail',
//   resourceType: 'image' | 'video' | 'auto' = 'auto'
// ): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: resourceType,
//       },
//       (error, result) => {
//         if (error || !result) {
//           return reject(error || new Error('Cloudinary upload failed'));
//         }
//         resolve(result.secure_url);
//       }
//     );

//     Readable.from(buffer).pipe(uploadStream);
//   });
// };

// // Memory Storage (eliminates ephemeral disk deletion on cloud deployment)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video ads & photos
// });

// // ====================================================
// // 0. Promote First Admin Route (0911000000 -> SUPERADMIN)
// // ====================================================
// router.get('/promote-first-admin', async (_req, res): Promise<any> => {
//   try {
//     const allTabs = ['orders', 'credit', 'products', 'categories', 'ads', 'users'];
//     const updated = await prisma.user.updateMany({
//       where: {
//         phoneNumber: { in: ['0911000000', '+251911000000'] },
//       },
//       data: {
//         role: 'SUPERADMIN',
//         allowedTabs: allTabs,
//       },
//     });

//     return res.json({
//       success: true,
//       message: `Updated ${updated.count} record(s) to SUPERADMIN with all tabs.`,
//     });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// // ====================================================
// // 1. Upload File Route (Cloudinary Stream for Images & Videos)
// // ====================================================
// router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'ምንም ፋይል አልተመረጠም (No file selected)' });
//     }

//     const isVideo = req.file.mimetype.startsWith('video');
//     const folder = isVideo ? 'b2b-retail/videos' : 'b2b-retail/images';
//     const resourceType = isVideo ? 'video' : 'image';

//     const secureUrl = await uploadToCloudinary(req.file.buffer, folder, resourceType);

//     return res.json({
//       url: secureUrl,
//       mediaType: isVideo ? 'VIDEO' : 'IMAGE',
//     });
//   } catch (err: any) {
//     console.error('Cloudinary upload error:', err);
//     return res.status(500).json({ error: err.message || 'ፋይሉን መጫን አልተቻለም' });
//   }
// });

// // ====================================================
// // 2. Advertisements / Banners (Up to 3 Images or Videos)
// // ====================================================
// router.get('/banners', async (_req, res): Promise<any> => {
//   try {
//     const banners = await prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } });
//     return res.json(banners);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// router.post('/banners', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const {
//       title,
//       mediaType,
//       mediaUrl,
//       mediaUrls,
//       mediaTypes,
//       actionLink,
//       displayOrder,
//     } = req.body;

//     const urlsArray: string[] = Array.isArray(mediaUrls) && mediaUrls.length > 0
//       ? mediaUrls.filter((u: string) => typeof u === 'string' && u.trim().length > 0)
//       : (mediaUrl ? [mediaUrl] : []);

//     const typesArray: string[] = Array.isArray(mediaTypes) && mediaTypes.length > 0
//       ? mediaTypes
//       : [mediaType || 'VIDEO'];

//     const primaryUrl = urlsArray[0] || mediaUrl || '';
//     const primaryType = typesArray[0] || mediaType || 'VIDEO';

//     // 1. Deactivate all existing banners so the old image never shows up again!
//     await prisma.banner.updateMany({
//       data: { isActive: false },
//     });

//     // 2. Create the brand new 3-video/image campaign
//     const banner = await prisma.banner.create({
//       data: {
//         title: title || 'ልዩ ማስታወቂያ',
//         mediaType: primaryType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
//         mediaUrl: primaryUrl,
//         mediaUrls: urlsArray.slice(0, 3),
//         mediaTypes: typesArray.slice(0, 3),
//         actionLink: actionLink || null,
//         displayOrder: Number(displayOrder) || 0,
//         isActive: true,
//       },
//     });

//     return res.status(201).json(banner);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// });

// // ====================================================
// // 2B. Post-Order Skippable Ad (3-Sec Countdown Popup)
// // ====================================================
// router.get('/interstitial-ad', async (_req, res): Promise<any> => {
//   try {
//     const ad = await prisma.interstitialAd.findFirst({
//       where: { isActive: true },
//       orderBy: { createdAt: 'desc' },
//     });
//     return res.json(ad || null);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// router.post('/interstitial-ad', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { title, mediaType, mediaUrl, actionLink, durationSec } = req.body;

//     if (!mediaUrl) {
//       return res.status(400).json({ error: 'የማስታወቂያው ቪዲዮ ወይም ምስል ሊንክ አልተገኘም' });
//     }

//     // Deactivate existing interstitial ads
//     await prisma.interstitialAd.updateMany({
//       data: { isActive: false },
//     });

//     const ad = await prisma.interstitialAd.create({
//       data: {
//         title: title || 'የትእዛዝ ማጠናቀቂያ ማስታወቂያ',
//         mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
//         mediaUrl,
//         actionLink: actionLink || null,
//         durationSec: Number(durationSec) || 3,
//         isActive: true,
//       },
//     });

//     return res.status(201).json(ad);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// });

// // ====================================================
// // 3. Categories
// // ====================================================
// router.get('/categories', async (_req, res): Promise<any> => {
//   try {
//     const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
//     return res.json(categories);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// router.post('/categories', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { nameAm, nameOm, iconUrl, displayOrder } = req.body;
//     const cat = await prisma.category.create({
//       data: {
//         nameAm,
//         nameOm: nameOm || nameAm,
//         iconUrl: iconUrl || '📦',
//         displayOrder: Number(displayOrder) || 0,
//       },
//     });
//     return res.status(201).json(cat);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// });

// // ====================================================
// // 4. Products - Admin Raw List
// // ====================================================
// router.get('/products', async (_req, res: Response): Promise<any> => {
//   try {
//     const products = await prisma.product.findMany({
//       orderBy: { createdAt: 'desc' },
//       include: { category: true },
//     });
//     return res.json(products);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'ምርቶችን ማግኘት አልተቻለም' });
//   }
// });

// // ====================================================
// // 5. Products - Create (Carton, Half Carton, Half Dozen & Packet Tiers)
// // ====================================================
// router.post('/products', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const {
//       categoryId,
//       nameAm,
//       nameOm,
//       imageUrl,
//       pricePerUnit,
//       unitType,
//       actualStock,
//       postedStock,
//       allowsHalfCarton,
//       priceHalfCarton,
//       allowsHalfDozen,
//       priceHalfDozen,
//       allowsPacket,
//       pricePacket,
//     } = req.body;

//     const actual = Number(actualStock ?? 50);
//     const posted = Number(postedStock ?? actual);

//     const prod = await prisma.product.create({
//       data: {
//         categoryId,
//         nameAm,
//         nameOm: nameOm || nameAm,
//         imageUrl: imageUrl || '📦',
//         pricePerUnit: Number(pricePerUnit),
//         unitType: unitType || 'CARTON',
//         actualStock: actual,
//         postedStock: posted,
//         currentStock: posted,
//         // Multi-tier breakdown pricing options
//         allowsHalfCarton: Boolean(allowsHalfCarton),
//         priceHalfCarton: priceHalfCarton ? Number(priceHalfCarton) : null,
//         allowsHalfDozen: Boolean(allowsHalfDozen),
//         priceHalfDozen: priceHalfDozen ? Number(priceHalfDozen) : null,
//         allowsPacket: Boolean(allowsPacket),
//         pricePacket: pricePacket ? Number(pricePacket) : null,
//       },
//       include: { category: true },
//     });

//     return res.status(201).json(prod);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// });

// // ====================================================
// // 6. Products - Full Edit (Strict Isolation between Stocks & Prices)
// // ====================================================
// router.put('/products/:id', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);
//     const {
//       categoryId,
//       nameAm,
//       nameOm,
//       imageUrl,
//       pricePerUnit,
//       unitType,
//       actualStock,
//       postedStock,
//       allowsHalfCarton,
//       priceHalfCarton,
//       allowsHalfDozen,
//       priceHalfDozen,
//       allowsPacket,
//       pricePacket,
//     } = req.body;

//     const parsedActual = actualStock !== undefined && actualStock !== '' ? Number(actualStock) : undefined;
//     const parsedPosted = postedStock !== undefined && postedStock !== '' ? Number(postedStock) : undefined;

//     const updateData: any = {
//       ...(categoryId ? { categoryId } : {}),
//       ...(nameAm ? { nameAm } : {}),
//       ...(nameOm !== undefined ? { nameOm } : {}),
//       ...(imageUrl ? { imageUrl } : {}),
//       ...(pricePerUnit !== undefined ? { pricePerUnit: Number(pricePerUnit) } : {}),
//       ...(unitType ? { unitType } : {}),
//       ...(parsedActual !== undefined ? { actualStock: parsedActual } : {}),
//       ...(parsedPosted !== undefined ? { postedStock: parsedPosted, currentStock: parsedPosted } : {}),
//       ...(allowsHalfCarton !== undefined ? { allowsHalfCarton: Boolean(allowsHalfCarton) } : {}),
//       ...(priceHalfCarton !== undefined ? { priceHalfCarton: priceHalfCarton ? Number(priceHalfCarton) : null } : {}),
//       ...(allowsHalfDozen !== undefined ? { allowsHalfDozen: Boolean(allowsHalfDozen) } : {}),
//       ...(priceHalfDozen !== undefined ? { priceHalfDozen: priceHalfDozen ? Number(priceHalfDozen) : null } : {}),
//       ...(allowsPacket !== undefined ? { allowsPacket: Boolean(allowsPacket) } : {}),
//       ...(pricePacket !== undefined ? { pricePacket: pricePacket ? Number(pricePacket) : null } : {}),
//     };

//     const updated = await prisma.product.update({
//       where: { id },
//       data: updateData,
//       include: { category: true },
//     });

//     return res.status(200).json({ success: true, product: updated });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ምርቱን ማስተካከል አልተቻለም' });
//   }
// });

// // ====================================================
// // 7. Products - Quick Restock (Increments both stocks)
// // ====================================================
// router.patch('/products/:id/restock', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);
//     const { addedStock } = req.body;

//     const quantityToAdd = Number(addedStock);
//     if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
//       return res.status(400).json({ error: 'ትክክለኛ የክምችት ቁጥር ያስገቡ (Valid stock quantity required)' });
//     }

//     const restocked = await prisma.product.update({
//       where: { id },
//       data: {
//         actualStock: { increment: quantityToAdd },
//         postedStock: { increment: quantityToAdd },
//         currentStock: { increment: quantityToAdd },
//       },
//       include: { category: true },
//     });

//     return res.status(200).json({
//       success: true,
//       message: `በተሳካ ሁኔታ ${quantityToAdd} ካርቶን ተጨምሯል`,
//       product: restocked,
//     });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ክምችት መጨመር አልተቻለም' });
//   }
// });

// // ====================================================
// // 8. Users, Approvals & Dynamic Credit Configuration
// // ====================================================
// router.get('/users', async (_req, res): Promise<any> => {
//   try {
//     const users = await prisma.user.findMany({
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         phoneNumber: true,
//         shopName: true,
//         role: true,
//         approvalStatus: true,
//         creditLimit: true,
//         usedCredit: true,
//         canOrderOnCredit: true, // For retailer credit checkbox
//         allowedTabs: true,
//         createdAt: true,
//       },
//     });
//     return res.json(users);
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// // Update Retailer Credit Settings (Toggle checkbox & Dynamic Limit)
// router.patch('/users/:id/credit-settings', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);
//     const { canOrderOnCredit, creditLimit } = req.body;

//     const dataToUpdate: any = {};
//     if (typeof canOrderOnCredit === 'boolean') {
//       dataToUpdate.canOrderOnCredit = canOrderOnCredit;
//     }
//     if (creditLimit !== undefined && !isNaN(Number(creditLimit))) {
//       dataToUpdate.creditLimit = Number(creditLimit);
//     }

//     const updated = await prisma.user.update({
//       where: { id },
//       data: dataToUpdate,
//     });

//     return res.json({
//       success: true,
//       message: 'የብድር ቅንብር በተሳካ ሁኔታ ተቀይሯል',
//       user: updated,
//     });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ቅንብሩን መቀየር አልተቻለም' });
//   }
// });

// router.patch('/users/:id/approval', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);
//     const { status } = req.body;
//     const updated = await prisma.user.update({
//       where: { id },
//       data: { approvalStatus: status },
//     });
//     return res.json({ success: true, user: updated });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// });

// router.post('/users', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { phoneNumber, shopName, password, role, allowedTabs } = req.body;
//     const hash = password ? await bcrypt.hash(password, 10) : null;

//     const user = await prisma.user.create({
//       data: {
//         phoneNumber,
//         shopName: shopName || 'አዲስ ተጠቃሚ',
//         password: hash,
//         role: role || 'ADMIN',
//         approvalStatus: 'APPROVED',
//         allowedTabs: Array.isArray(allowedTabs) && allowedTabs.length > 0
//           ? allowedTabs
//           : ['orders', 'products'],
//       },
//     });
//     return res.status(201).json(user);
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// });

// router.patch('/users/:id/permissions', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);
//     const { allowedTabs } = req.body;

//     if (!Array.isArray(allowedTabs)) {
//       return res.status(400).json({ error: 'የተፈቀዱ ገጾች ዝርዝር (allowedTabs) በትክክል አልተላከም' });
//     }

//     const updated = await prisma.user.update({
//       where: { id },
//       data: { allowedTabs },
//     });

//     return res.json({
//       success: true,
//       message: 'የአስተዳዳሪው ፍቃድ በተሳካ ሁኔታ ተስተካክሏል',
//       user: updated,
//     });
//   } catch (err: any) {
//     return res.status(400).json({ error: err.message || 'ፍቃዱን ማስተካከል አልተቻለም' });
//   }
// });

// // ====================================================
// // 8B. Real-Time Order Counter for Green Blinking Badge
// // ====================================================
// router.get('/orders/stats', async (_req, res): Promise<any> => {
//   try {
//     const [pendingOrdersCount, pendingCreditCount, latestOrder] = await Promise.all([
//       prisma.order.count({ where: { status: 'PENDING', isCreditOrder: false } }),
//       prisma.order.count({ where: { status: 'PENDING', isCreditOrder: true } }),
//       prisma.order.findFirst({
//         orderBy: { createdAt: 'desc' },
//         select: { id: true, createdAt: true },
//       }),
//     ]);

//     return res.json({
//       pendingOrdersCount,
//       pendingCreditCount,
//       latestOrderTimestamp: latestOrder?.createdAt || null,
//       latestOrderId: latestOrder?.id || null,
//     });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// // ====================================================
// // 9. Delete Category (Cascades products)
// // ====================================================
// router.delete('/categories/:id', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);

//     const category = await prisma.category.findUnique({
//       where: { id },
//       include: { products: { select: { id: true } } },
//     });

//     if (!category) {
//       return res.status(404).json({ error: 'ምድቡ አልተገኘም' });
//     }

//     const productIds = category.products.map((p: any) => p.id);

//     await prisma.$transaction(async (tx) => {
//       if (productIds.length > 0) {
//         await tx.orderItem.deleteMany({
//           where: { productId: { in: productIds } },
//         });

//         await tx.product.deleteMany({
//           where: { categoryId: id },
//         });
//       }

//       await tx.category.delete({
//         where: { id },
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'ምድቡ፣ በውስጡ ያሉ ምርቶች እና ተዛማጅ ትእዛዞች ሙሉ በሙሉ ተሰርዘዋል',
//     });
//   } catch (err: any) {
//     console.error('Delete category error:', err);
//     return res.status(500).json({ error: err.message || 'ምድቡን መሰረዝ አልተቻለም' });
//   }
// });

// // ====================================================
// // 10. Delete Single Product
// // ====================================================
// router.delete('/products/:id', async (req: Request, res: Response): Promise<any> => {
//   try {
//     const id = String(req.params.id);

//     const existing = await prisma.product.findUnique({ where: { id } });
//     if (!existing) {
//       return res.status(404).json({ error: 'ምርቱ አልተገኘም' });
//     }

//     const orderItemCount = await prisma.orderItem.count({
//       where: { productId: id },
//     });

//     if (orderItemCount > 0) {
//       const updated = await prisma.product.update({
//         where: { id },
//         data: { isActive: false },
//       });
//       return res.status(200).json({
//         success: true,
//         message: 'ምርቱ ከገበያ ተሰውሯል',
//         product: updated,
//       });
//     }

//     await prisma.product.delete({ where: { id } });
//     return res.status(200).json({ success: true, message: 'ምርቱ ተሰርዟል' });
//   } catch (err: any) {
//     return res.status(500).json({ error: err.message || 'ምርቱን መሰረዝ አልተቻለም' });
//   }
// });

// export default router;
import { Router, Request, Response } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import prisma from '../../config/db';

const router = Router();

// ====================================================
// Cloudinary Configuration
// ====================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'beahlrqy',
  api_key: process.env.CLOUDINARY_API_KEY || '953418283816441',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'RJVVmv3OHuzQ05Zm_l4L_F6SwZo',
  secure: true,
});

// Stream buffer directly to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = 'b2b-retail',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// Memory Storage (eliminates ephemeral disk deletion on cloud deployment)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video ads & photos
});

// ====================================================
// 0. Promote First Admin Route (0911000000 -> SUPERADMIN)
// ====================================================
router.get('/promote-first-admin', async (_req, res): Promise<any> => {
  try {
    const allTabs = ['orders', 'credit', 'products', 'categories', 'ads', 'users', 'notifications'];
    const updated = await prisma.user.updateMany({
      where: {
        phoneNumber: { in: ['0911000000', '+251911000000'] },
      },
      data: {
        role: 'SUPERADMIN',
        allowedTabs: allTabs,
      },
    });

    return res.json({
      success: true,
      message: `Updated ${updated.count} record(s) to SUPERADMIN with all tabs.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ====================================================
// 1. Upload File Route (Cloudinary Stream for Images & Videos)
// ====================================================
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ምንም ፋይል አልተመረጠም (No file selected)' });
    }

    const isVideo = req.file.mimetype.startsWith('video');
    const folder = isVideo ? 'b2b-retail/videos' : 'b2b-retail/images';
    const resourceType = isVideo ? 'video' : 'image';

    const secureUrl = await uploadToCloudinary(req.file.buffer, folder, resourceType);

    return res.json({
      url: secureUrl,
      mediaType: isVideo ? 'VIDEO' : 'IMAGE',
    });
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ error: err.message || 'ፋይሉን መጫን አልተቻለም' });
  }
});

// ====================================================
// 2. Advertisements / Banners (Up to 3 Images or Videos)
// ====================================================
router.get('/banners', async (_req, res): Promise<any> => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } });
    return res.json(banners);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/banners', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      mediaType,
      mediaUrl,
      mediaUrls,
      mediaTypes,
      actionLink,
      displayOrder,
    } = req.body;

    const urlsArray: string[] = Array.isArray(mediaUrls) && mediaUrls.length > 0
      ? mediaUrls.filter((u: string) => typeof u === 'string' && u.trim().length > 0)
      : (mediaUrl ? [mediaUrl] : []);

    const typesArray: string[] = Array.isArray(mediaTypes) && mediaTypes.length > 0
      ? mediaTypes
      : [mediaType || 'VIDEO'];

    const primaryUrl = urlsArray[0] || mediaUrl || '';
    const primaryType = typesArray[0] || mediaType || 'VIDEO';

    await prisma.banner.updateMany({
      data: { isActive: false },
    });

    const banner = await prisma.banner.create({
      data: {
        title: title || 'ልዩ ማስታወቂያ',
        mediaType: primaryType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mediaUrl: primaryUrl,
        mediaUrls: urlsArray.slice(0, 3),
        mediaTypes: typesArray.slice(0, 3),
        actionLink: actionLink || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: true,
      },
    });

    return res.status(201).json(banner);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ====================================================
// 2B. Post-Order Skippable Ad (3-Sec Countdown Popup) & Ad Seen Count
// ====================================================
router.get('/interstitial-ad', async (_req, res): Promise<any> => {
  try {
    const ad = await prisma.interstitialAd.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(ad || null);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/interstitial-ad', async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, mediaType, mediaUrl, actionLink, durationSec } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({ error: 'የማስታወቂያው ቪዲዮ ወይም ምስል ሊንክ አልተገኘም' });
    }

    await prisma.interstitialAd.updateMany({
      data: { isActive: false },
    });

    const ad = await prisma.interstitialAd.create({
      data: {
        title: title || 'የትእዛዝ ማጠናቀቂያ ማስታወቂያ',
        mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mediaUrl,
        actionLink: actionLink || null,
        durationSec: Number(durationSec) || 3,
        viewCount: 0,
        isActive: true,
      },
    });

    return res.status(201).json(ad);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/interstitial-ad/stats', async (_req, res): Promise<any> => {
  try {
    const ads = await prisma.interstitialAd.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, viewCount: true, isActive: true, createdAt: true },
    });
    return res.json(ads);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ====================================================
// 2C. Broadcast Notifications Management
// ====================================================
router.get('/notifications', async (_req, res): Promise<any> => {
  try {
    const notifications = await (prisma as any).notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/notifications', async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'የማስታወቂያ መልእክት መጻፍ አለበት' });
    }

    const notification = await (prisma as any).notification.create({
      data: {
        title: title || 'አዲስ ማስታወቂያ',
        message,
        isActive: true,
      },
    });

    return res.status(201).json({ success: true, notification });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/notifications/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    await (prisma as any).notification.delete({ where: { id } });
    return res.json({ success: true, message: 'ማስታወቂያው ተሰርዟል' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ====================================================
// 3. Categories
// ====================================================
router.get('/categories', async (_req, res): Promise<any> => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req: Request, res: Response): Promise<any> => {
  try {
    const { nameAm, nameOm, iconUrl, displayOrder } = req.body;
    const cat = await prisma.category.create({
      data: {
        nameAm,
        nameOm: nameOm || nameAm,
        iconUrl: iconUrl || '📦',
        displayOrder: Number(displayOrder) || 0,
      },
    });
    return res.status(201).json(cat);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ====================================================
// 4. Products - Admin Raw List
// ====================================================
router.get('/products', async (_req, res: Response): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ምርቶችን ማግኘት አልተቻለም' });
  }
});

// ====================================================
// 5. Products - Create
// ====================================================
router.post('/products', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      categoryId,
      nameAm,
      nameOm,
      imageUrl,
      pricePerUnit,
      unitType,
      actualStock,
      postedStock,
      allowsHalfCarton,
      priceHalfCarton,
      allowsHalfDozen,
      priceHalfDozen,
      allowsPacket,
      pricePacket,
    } = req.body;

    const actual = Number(actualStock ?? 50);
    const posted = Number(postedStock ?? actual);

    const prod = await prisma.product.create({
      data: {
        categoryId,
        nameAm,
        nameOm: nameOm || nameAm,
        imageUrl: imageUrl || '📦',
        pricePerUnit: Number(pricePerUnit),
        unitType: unitType || 'CARTON',
        actualStock: actual,
        postedStock: posted,
        currentStock: posted,
        allowsHalfCarton: Boolean(allowsHalfCarton),
        priceHalfCarton: priceHalfCarton ? Number(priceHalfCarton) : null,
        allowsHalfDozen: Boolean(allowsHalfDozen),
        priceHalfDozen: priceHalfDozen ? Number(priceHalfDozen) : null,
        allowsPacket: Boolean(allowsPacket),
        pricePacket: pricePacket ? Number(pricePacket) : null,
      },
      include: { category: true },
    });

    return res.status(201).json(prod);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ====================================================
// 6. Products - Full Edit
// ====================================================
router.put('/products/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    const {
      categoryId,
      nameAm,
      nameOm,
      imageUrl,
      pricePerUnit,
      unitType,
      actualStock,
      postedStock,
      allowsHalfCarton,
      priceHalfCarton,
      allowsHalfDozen,
      priceHalfDozen,
      allowsPacket,
      pricePacket,
    } = req.body;

    const parsedActual = actualStock !== undefined && actualStock !== '' ? Number(actualStock) : undefined;
    const parsedPosted = postedStock !== undefined && postedStock !== '' ? Number(postedStock) : undefined;

    const updateData: any = {
      ...(categoryId ? { categoryId } : {}),
      ...(nameAm ? { nameAm } : {}),
      ...(nameOm !== undefined ? { nameOm } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(pricePerUnit !== undefined ? { pricePerUnit: Number(pricePerUnit) } : {}),
      ...(unitType ? { unitType } : {}),
      ...(parsedActual !== undefined ? { actualStock: parsedActual } : {}),
      ...(parsedPosted !== undefined ? { postedStock: parsedPosted, currentStock: parsedPosted } : {}),
      ...(allowsHalfCarton !== undefined ? { allowsHalfCarton: Boolean(allowsHalfCarton) } : {}),
      ...(priceHalfCarton !== undefined ? { priceHalfCarton: priceHalfCarton ? Number(priceHalfCarton) : null } : {}),
      ...(allowsHalfDozen !== undefined ? { allowsHalfDozen: Boolean(allowsHalfDozen) } : {}),
      ...(priceHalfDozen !== undefined ? { priceHalfDozen: priceHalfDozen ? Number(priceHalfDozen) : null } : {}),
      ...(allowsPacket !== undefined ? { allowsPacket: Boolean(allowsPacket) } : {}),
      ...(pricePacket !== undefined ? { pricePacket: pricePacket ? Number(pricePacket) : null } : {}),
    };

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return res.status(200).json({ success: true, product: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ምርቱን ማስተካከል አልተቻለም' });
  }
});

// ====================================================
// 7. Products - Quick Restock
// ====================================================
router.patch('/products/:id/restock', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    const { addedStock } = req.body;

    const quantityToAdd = Number(addedStock);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return res.status(400).json({ error: 'ትክክለኛ የክምችት ቁጥር ያስገቡ' });
    }

    const restocked = await prisma.product.update({
      where: { id },
      data: {
        actualStock: { increment: quantityToAdd },
        postedStock: { increment: quantityToAdd },
        currentStock: { increment: quantityToAdd },
      },
      include: { category: true },
    });

    return res.status(200).json({
      success: true,
      message: `በተሳካ ሁኔታ ${quantityToAdd} ካርቶን ተጨምሯል`,
      product: restocked,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ክምችት መጨመር አልተቻለም' });
  }
});

// ====================================================
// 8. Users & Credit Settings
// ====================================================
router.get('/users', async (_req, res): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phoneNumber: true,
        shopName: true,
        role: true,
        approvalStatus: true,
        creditLimit: true,
        usedCredit: true,
        canOrderOnCredit: true,
        allowedTabs: true,
        createdAt: true,
      },
    });
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/credit-settings', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    const { canOrderOnCredit, creditLimit } = req.body;

    const dataToUpdate: any = {};
    if (typeof canOrderOnCredit === 'boolean') {
      dataToUpdate.canOrderOnCredit = canOrderOnCredit;
    }
    if (creditLimit !== undefined && !isNaN(Number(creditLimit))) {
      dataToUpdate.creditLimit = Number(creditLimit);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json({
      success: true,
      message: 'የብድር ቅንብር በተሳካ ሁኔታ ተቀይሯል',
      user: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ቅንብሩን መቀየር አልተቻለም' });
  }
});

router.patch('/users/:id/approval', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { approvalStatus: status },
    });
    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/users', async (req: Request, res: Response): Promise<any> => {
  try {
    const { phoneNumber, shopName, password, role, allowedTabs } = req.body;
    const hash = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        shopName: shopName || 'አዲስ ተጠቃሚ',
        password: hash,
        role: role || 'ADMIN',
        approvalStatus: 'APPROVED',
        allowedTabs: Array.isArray(allowedTabs) && allowedTabs.length > 0
          ? allowedTabs
          : ['orders', 'products'],
      },
    });
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.patch('/users/:id/permissions', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    const { allowedTabs } = req.body;

    if (!Array.isArray(allowedTabs)) {
      return res.status(400).json({ error: 'የተፈቀዱ ገጾች ዝርዝር በትክክል አልተላከም' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { allowedTabs },
    });

    return res.json({
      success: true,
      message: 'የአስተዳዳሪው ፍቃድ በተሳካ ሁኔታ ተስተካክሏል',
      user: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'ፍቃዱን ማስተካከል አልተቻለም' });
  }
});

router.get('/orders/stats', async (_req, res): Promise<any> => {
  try {
    const [pendingOrdersCount, pendingCreditCount, latestOrder] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING', isCreditOrder: false } }),
      prisma.order.count({ where: { status: 'PENDING', isCreditOrder: true } }),
      prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true },
      }),
    ]);

    return res.json({
      pendingOrdersCount,
      pendingCreditCount,
      latestOrderTimestamp: latestOrder?.createdAt || null,
      latestOrderId: latestOrder?.id || null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ====================================================
// 9. Delete Category & Products
// ====================================================
router.delete('/categories/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: { select: { id: true } } },
    });

    if (!category) {
      return res.status(404).json({ error: 'ምድቡ አልተገኘም' });
    }

    const productIds = category.products.map((p: any) => p.id);

    await prisma.$transaction(async (tx) => {
      if (productIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { productId: { in: productIds } },
        });

        await tx.product.deleteMany({
          where: { categoryId: id },
        });
      }

      await tx.category.delete({
        where: { id },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'ምድቡ፣ በውስጡ ያሉ ምርቶች እና ተዛማጅ ትእዛዞች ሙሉ በሙሉ ተሰርዘዋል',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ምድቡን መሰረዝ አልተቻለም' });
  }
});

// ====================================================
// 10. Delete Single Product
// ====================================================
router.delete('/products/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'ምርቱ አልተገኘም' });
    }

    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      const updated = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return res.status(200).json({
        success: true,
        message: 'ምርቱ ከገበያ ተሰውሯል',
        product: updated,
      });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'ምርቱ ተሰርዟል' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'ምርቱን መሰረዝ አልተቻለም' });
  }
});

export default router;