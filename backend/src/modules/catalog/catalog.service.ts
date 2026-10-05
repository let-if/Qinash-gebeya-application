
// import prisma from '../../config/db';

// function serializeProduct(product: {
//   id: string;
//   categoryId: string;
//   nameAm: string;
//   nameOm: string;
//   imageUrl: string;
//   unitType: string;
//   pricePerUnit: { toString(): string } | number;
//   allowsHalfCarton: boolean;
//   priceHalfCarton: { toString(): string } | number | null;
//   minimumOrderQty: number;
//   isFastMoving: boolean;
//   hasReturnGuarantee: boolean;
//   currentStock?: number | null;
//   brand?: string | null;
//   expiryDate?: string | Date | null;
//   category?: any;
// }) {
//   return {
//     id: product.id,
//     categoryId: product.categoryId,
//     nameAm: product.nameAm,
//     nameOm: product.nameOm,
//     imageUrl: product.imageUrl,
//     unitType: product.unitType,
//     pricePerUnit: Number(product.pricePerUnit),
//     allowsHalfCarton: product.allowsHalfCarton,
//     priceHalfCarton: product.priceHalfCarton == null ? null : Number(product.priceHalfCarton),
//     minimumOrderQty: product.minimumOrderQty,
//     isFastMoving: product.isFastMoving,
//     hasReturnGuarantee: product.hasReturnGuarantee,
//     currentStock: product.currentStock ?? 0,
//     brand: product.brand ?? 'ቀጥታ ከአምራች ፋብሪካ',
//     expiryDate: product.expiryDate ? String(product.expiryDate) : 'ታኅሣሥ 2027',
//     category: product.category || undefined,
//   };
// }

// export class CatalogService {
//   static async listCategories() {
//     const categories = await prisma.category.findMany({
//       where: { isActive: true },
//       orderBy: { displayOrder: 'asc' },
//       select: {
//         id: true,
//         nameAm: true,
//         nameOm: true,
//         iconUrl: true,
//         displayOrder: true,
//       },
//     });
//     return categories;
//   }

//   static async listProducts(filters: { categoryId?: string; fastMoving?: boolean }) {
//     const products = await prisma.product.findMany({
//       where: {
//         isActive: true,
//         ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
//         ...(filters.fastMoving ? { isFastMoving: true } : {}),
//       },
//       include: {
//         category: {
//           select: {
//             id: true,
//             nameAm: true,
//             nameOm: true,
//           },
//         },
//       },
//       orderBy: [{ isFastMoving: 'desc' }, { createdAt: 'desc' }],
//     });
//     return products.map(serializeProduct);
//   }

//   static async getProductById(id: string) {
//     const product = await prisma.product.findUnique({
//       where: { id },
//       include: { category: true },
//     });
//     if (!product) return null;
//     return serializeProduct(product);
//   }

//   // Update product stock and price (Used by Admin Inventory View)
//   static async updateProduct(
//     id: string,
//     data: { currentStock?: number; pricePerUnit?: number; isActive?: boolean }
//   ) {
//     const updated = await prisma.product.update({
//       where: { id },
//       data: {
//         ...(data.currentStock !== undefined ? { currentStock: Number(data.currentStock) } : {}),
//         ...(data.pricePerUnit !== undefined ? { pricePerUnit: Number(data.pricePerUnit) } : {}),
//         ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
//       },
//       include: { category: true },
//     });
//     return serializeProduct(updated);
//   }

//   // Delete product
//   static async deleteProduct(id: string) {
//     return await prisma.product.delete({
//       where: { id },
//     });
//   }

//   // Delete category (cascade deletes associated products)
//   static async deleteCategory(id: string) {
//     return await prisma.category.delete({
//       where: { id },
//     });
//   }

//   // Fetch only the latest active pushed advertisement (Video or Image)
//   // static async listAds() {
//   //   const banners = await prisma.banner.findMany({
//   //     where: { isActive: true },
//   //     orderBy: { createdAt: 'desc' },
//   //     take: 1,
//   //   });

//   //   return banners.map((b) => ({
//   //     id: b.id,
//   //     title: b.title,
//   //     type: b.mediaType === 'VIDEO' ? 'video' : 'image',
//   //     mediaType: b.mediaType,
//   //     mediaUrl: b.mediaUrl,
//   //     thumbnailUrl: b.thumbnailUrl,
//   //     actionLink: b.actionLink,
//   //     displayOrder: b.displayOrder,
//   //   }));
//   // }
//   static async listAds() {
//     // 1. Fetch ONLY the single most recently published advertisement campaign
//     const latestBanner = await prisma.banner.findFirst({
//       where: { isActive: true },
//       orderBy: { createdAt: 'desc' }, // Guarantees you get the latest inserted ad
//     });

//     if (!latestBanner) {
//       return [];
//     }

//     // 2. Return ONLY this latest banner with its 3 media slots
//     return [
//       {
//         id: latestBanner.id,
//         title: latestBanner.title,
//         type: latestBanner.mediaType === 'VIDEO' ? 'video' : 'image',
//         mediaType: latestBanner.mediaType,
//         mediaUrl: latestBanner.mediaUrl,
//         mediaUrls: Array.isArray(latestBanner.mediaUrls) && latestBanner.mediaUrls.length > 0
//           ? latestBanner.mediaUrls
//           : (latestBanner.mediaUrl ? [latestBanner.mediaUrl] : []),
//         mediaTypes: Array.isArray(latestBanner.mediaTypes) && latestBanner.mediaTypes.length > 0
//           ? latestBanner.mediaTypes
//           : [latestBanner.mediaType || 'VIDEO'],
//         thumbnailUrl: latestBanner.thumbnailUrl,
//         actionLink: latestBanner.actionLink,
//         displayOrder: latestBanner.displayOrder,
//       },
//     ];
//   }
// }
import prisma from '../../config/db';

function serializeProduct(product: {
  id: string;
  categoryId: string;
  nameAm: string;
  nameOm?: string | null;
  imageUrl: string;
  unitType: string;
  pricePerUnit: { toString(): string } | number;
  allowsHalfCarton?: boolean;
  priceHalfCarton?: { toString(): string } | number | null;
  allowsHalfDozen?: boolean;
  priceHalfDozen?: { toString(): string } | number | null;
  allowsPacket?: boolean;
  pricePacket?: { toString(): string } | number | null;
  minimumOrderQty?: number;
  isFastMoving?: boolean;
  hasReturnGuarantee?: boolean;
  actualStock?: number | null;
  postedStock?: number | null;
  currentStock?: number | null;
  brand?: string | null;
  expiryDate?: string | Date | null;
  category?: any;
}) {
  return {
    id: product.id,
    categoryId: product.categoryId,
    nameAm: product.nameAm,
    nameOm: product.nameOm || '',
    imageUrl: product.imageUrl,
    unitType: product.unitType,
    pricePerUnit: Number(product.pricePerUnit),
    // 4-Tier Breakdown Pricing
    allowsHalfCarton: Boolean(product.allowsHalfCarton),
    priceHalfCarton: product.priceHalfCarton == null ? null : Number(product.priceHalfCarton),
    allowsHalfDozen: Boolean(product.allowsHalfDozen),
    priceHalfDozen: product.priceHalfDozen == null ? null : Number(product.priceHalfDozen),
    allowsPacket: Boolean(product.allowsPacket),
    pricePacket: product.pricePacket == null ? null : Number(product.pricePacket),
    minimumOrderQty: product.minimumOrderQty ?? 1,
    isFastMoving: Boolean(product.isFastMoving),
    hasReturnGuarantee: Boolean(product.hasReturnGuarantee),
    // Dual Inventory Safe Serialization
    actualStock: product.actualStock ?? product.currentStock ?? 50,
    postedStock: product.postedStock ?? product.currentStock ?? 50,
    currentStock: product.postedStock ?? product.currentStock ?? 50,
    brand: product.brand ?? 'ቀጥታ ከአምራች ፋብሪካ',
    expiryDate: product.expiryDate ? String(product.expiryDate) : 'ታኅሣሥ 2027',
    category: product.category || undefined,
  };
}

export class CatalogService {
  static async listCategories() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        nameAm: true,
        nameOm: true,
        iconUrl: true,
        displayOrder: true,
      },
    });
    return categories;
  }

  static async listProducts(filters: { categoryId?: string; fastMoving?: boolean }) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.fastMoving ? { isFastMoving: true } : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            nameAm: true,
            nameOm: true,
          },
        },
      },
      orderBy: [{ isFastMoving: 'desc' }, { createdAt: 'desc' }],
    });
    return products.map(serializeProduct);
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return null;
    return serializeProduct(product);
  }

  // Update product stock and price (Used by Admin Inventory View)
  static async updateProduct(
    id: string,
    data: {
      actualStock?: number;
      postedStock?: number;
      currentStock?: number;
      pricePerUnit?: number;
      isActive?: boolean;
      allowsHalfCarton?: boolean;
      priceHalfCarton?: number | null;
      allowsHalfDozen?: boolean;
      priceHalfDozen?: number | null;
      allowsPacket?: boolean;
      pricePacket?: number | null;
    }
  ) {
    const updateData: any = {};
    if (data.pricePerUnit !== undefined) updateData.pricePerUnit = Number(data.pricePerUnit);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.actualStock !== undefined) updateData.actualStock = Number(data.actualStock);
    if (data.postedStock !== undefined) {
      updateData.postedStock = Number(data.postedStock);
      updateData.currentStock = Number(data.postedStock);
    } else if (data.currentStock !== undefined) {
      updateData.currentStock = Number(data.currentStock);
      updateData.postedStock = Number(data.currentStock);
    }
    if (data.allowsHalfCarton !== undefined) updateData.allowsHalfCarton = Boolean(data.allowsHalfCarton);
    if (data.priceHalfCarton !== undefined) updateData.priceHalfCarton = data.priceHalfCarton;
    if (data.allowsHalfDozen !== undefined) updateData.allowsHalfDozen = Boolean(data.allowsHalfDozen);
    if (data.priceHalfDozen !== undefined) updateData.priceHalfDozen = data.priceHalfDozen;
    if (data.allowsPacket !== undefined) updateData.allowsPacket = Boolean(data.allowsPacket);
    if (data.pricePacket !== undefined) updateData.pricePacket = data.pricePacket;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
    return serializeProduct(updated);
  }

  // Delete product
  static async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  // Delete category (cascade deletes associated products)
  static async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }

  // Fetch only the latest active pushed advertisement campaign with clean 3-slot media arrays
  // static async listAds() {
  //   // 1. Fetch strictly the newest active advertisement campaign
  //   const latestBanner = await prisma.banner.findFirst({
  //     where: { isActive: true },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   if (!latestBanner) {
  //     return [];
  //   }

  //   // 2. Extract and sanitize up to 3 valid media items
  //   let validUrls: string[] = [];
  //   if (Array.isArray(latestBanner.mediaUrls) && latestBanner.mediaUrls.length > 0) {
  //     validUrls = latestBanner.mediaUrls.filter((u) => typeof u === 'string' && u.trim().length > 0);
  //   }

  //   // Fallback to mediaUrl if array is empty
  //   if (validUrls.length === 0 && latestBanner.mediaUrl) {
  //     validUrls = [latestBanner.mediaUrl];
  //   }

  //   // Map corresponding media types
  //   const rawTypes = Array.isArray(latestBanner.mediaTypes) ? latestBanner.mediaTypes : [];
  //   const validTypes = validUrls.map((url, idx) => {
  //     if (rawTypes[idx]) return rawTypes[idx];
  //     return /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(url) ? 'VIDEO' : 'IMAGE';
  //   });

  //   return [
  //     {
  //       id: latestBanner.id,
  //       title: latestBanner.title,
  //       type: validTypes[0] === 'VIDEO' ? 'video' : 'image',
  //       mediaType: validTypes[0] || latestBanner.mediaType,
  //       mediaUrl: validUrls[0] || latestBanner.mediaUrl,
  //       mediaUrls: validUrls.slice(0, 3),   // Guarantees only the 3 latest uploaded files
  //       mediaTypes: validTypes.slice(0, 3), // Matching types for each slot
  //       thumbnailUrl: latestBanner.thumbnailUrl,
  //       actionLink: latestBanner.actionLink,
  //       displayOrder: latestBanner.displayOrder,
  //     },
  //   ];
  // }
  static async listAds() {
    // Look for the active banner with mediaUrls, falling back to newest created
    const banner = await prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!banner) {
      // Fallback: look for ANY latest banner even if isActive flag was untouched
      const anyLatest = await prisma.banner.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (!anyLatest) return [];
      
      const urls = Array.isArray(anyLatest.mediaUrls) && anyLatest.mediaUrls.length > 0
        ? anyLatest.mediaUrls
        : (anyLatest.mediaUrl ? [anyLatest.mediaUrl] : []);

      return [{
        id: anyLatest.id,
        title: anyLatest.title,
        mediaType: anyLatest.mediaType,
        mediaUrl: anyLatest.mediaUrl,
        mediaUrls: urls,
        mediaTypes: anyLatest.mediaTypes || ['VIDEO'],
      }];
    }

    const urls = Array.isArray(banner.mediaUrls) && banner.mediaUrls.length > 0
      ? banner.mediaUrls
      : (banner.mediaUrl ? [banner.mediaUrl] : []);

    return [
      {
        id: banner.id,
        title: banner.title,
        mediaType: banner.mediaType,
        mediaUrl: banner.mediaUrl,
        mediaUrls: urls,
        mediaTypes: banner.mediaTypes || ['VIDEO'],
        actionLink: banner.actionLink,
        displayOrder: banner.displayOrder,
      },
    ];
  }
}