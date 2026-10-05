import prisma from '../src/config/db';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records (optional, avoids duplicates during development)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Seed 8 B2B Categories
  const categoriesData = [
    {
      nameAm: 'ግሮሰሪ እና የባልትና ውጤቶች',
      nameOm: 'Giroosarii fi Oomishaalee Baltinaa',
      iconUrl: '🛒',
      displayOrder: 1,
    },
    {
      nameAm: 'የጽዳት እና የግል እንክብካቤ እቃዎች',
      nameOm: 'Qulqullinaa fi Meeshaalee Eegumsaa',
      iconUrl: '🧽',
      displayOrder: 2,
    },
    {
      nameAm: 'መጠጦች',
      nameOm: 'Dhugaatiiwwan',
      iconUrl: '🥤',
      displayOrder: 3,
    },
    {
      nameAm: 'መክሰስ እና ጣፋጮች',
      nameOm: "Makkasii fi Mi'aawaa",
      iconUrl: '🍬',
      displayOrder: 4,
    },
    {
      nameAm: 'የጽህፈት መሳሪያዎች',
      nameOm: 'Meeshaalee Barreeffamaa',
      iconUrl: '✏️',
      displayOrder: 5,
    },
    {
      nameAm: 'የግብርና ምርቶች እና አትክልት',
      nameOm: 'Oomishaalee Qonnaa fi Kuduraa',
      iconUrl: '🥔',
      displayOrder: 6,
    },
    {
      nameAm: 'የማሸጊያ እቃዎች እና ሻማ',
      nameOm: 'Meeshaalee Qoricpaa fi Xoofoo',
      iconUrl: '📦',
      displayOrder: 7,
    },
    {
      nameAm: 'የትምባሆ ምርቶች',
      nameOm: 'Oomishaalee Tamboo',
      iconUrl: '🚬',
      displayOrder: 8,
    },
  ];

  const createdCategories: Record<number, { id: string }> = {};

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = await prisma.category.create({
      data: categoriesData[i],
    });
    createdCategories[i + 1] = cat;
  }

  // 3. Seed Fast-Moving Products with Flexible Unit Split (Carton & Half-Carton)
  const productsData = [
    {
      categoryId: createdCategories[1].id,
      nameAm: 'ዘይት 5ሊ (Oil 5L)',
      nameOm: 'Zayita 5L',
      imageUrl: '🛢️',
      unitType: 'CARTON' as const,
      pricePerUnit: 2800,
      allowsHalfCarton: true,
      priceHalfCarton: 1450,
      isFastMoving: true,
      hasReturnGuarantee: true,
    },
    {
      categoryId: createdCategories[1].id,
      nameAm: 'ዱቄት 25ኪግ (Flour)',
      nameOm: 'Daakuu 25kg',
      imageUrl: '🌾',
      unitType: 'CARTON' as const,
      pricePerUnit: 3200,
      allowsHalfCarton: true,
      priceHalfCarton: 1650,
      isFastMoving: true,
      hasReturnGuarantee: true,
    },
    {
      categoryId: createdCategories[1].id,
      nameAm: 'ፓስታ (Pasta)',
      nameOm: 'Paastaa',
      imageUrl: '🍝',
      unitType: 'CARTON' as const,
      pricePerUnit: 1500,
      allowsHalfCarton: true,
      priceHalfCarton: 780,
      isFastMoving: true,
      hasReturnGuarantee: true,
    },
    {
      categoryId: createdCategories[2].id,
      nameAm: 'ቢ 29 ሳሙና (Soap B29)',
      nameOm: 'Saamunaa B29',
      imageUrl: '🧼',
      unitType: 'CARTON' as const,
      pricePerUnit: 1900,
      allowsHalfCarton: false,
      isFastMoving: true,
      hasReturnGuarantee: true,
    },
    {
      categoryId: createdCategories[3].id,
      nameAm: 'የታሸገ ውሃ 1ሊ (Bottled Water)',
      nameOm: 'Bishaan 1L',
      imageUrl: '💧',
      unitType: 'CARTON' as const,
      pricePerUnit: 480,
      allowsHalfCarton: false,
      isFastMoving: true,
      hasReturnGuarantee: true,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({
      data: prod,
    });
  }

  console.log('✅ Seeded 8 Categories and Fast-Moving Products successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
//   datasource db {
//   provider = "postgresql"

// }

// generator client {
//   provider = "prisma-client-js"
// }

// // ----------------------------------------------------
// // ENUMS
// // ----------------------------------------------------

// enum Role {
//   RETAILER
//   SALES_REP
//   DISPATCHER
//   ADMIN
//   SUPERADMIN
// }

// enum ApprovalStatus {
//   PENDING
//   APPROVED
//   REJECTED
//   SUSPENDED
// }

// enum UnitType {
//   CARTON
//   HALF_CARTON
//   DOZEN
//   PACK
//   KG
//   QUINTAL
//   MEREB
//   PIECE
// }

// enum OrderStatus {
//   PENDING
//   CONFIRMED
//   DISPATCHED
//   DELIVERED
//   CANCELLED
// }

// enum DeliverySlot {
//   BATCH_6AM
//   BATCH_12PM
// }

// enum OrderSource {
//   APP_DATA
//   OFFLINE_SMS
// }

// enum LedgerType {
//   CREDIT_GIVEN
//   PAYMENT_RECEIVED
// }

// enum MediaType {
//   IMAGE
//   VIDEO
// }

// // ----------------------------------------------------
// // MODELS
// // ----------------------------------------------------

// model Order {
//   id              String       @id @default(uuid()) @map("order_id")
//   userId          String       @map("user_id")
//   totalAmount     Decimal      @map("total_amount") @db.Decimal(10, 2)
//   deliverySlot    DeliverySlot @map("delivery_slot")
//   status          OrderStatus  @default(PENDING)
//   orderSource     OrderSource  @default(APP_DATA) @map("order_source")
//   voiceNoteUrl    String?      @map("voice_note_url")

//   // --- Credit Workflow Additions ---
//   isCreditOrder   Boolean      @default(false) @map("is_credit_order")
//   creditApproved  Boolean?     @map("credit_approved")
//   isCreditSettled Boolean      @default(false) @map("is_credit_settled")

//   createdAt       DateTime     @default(now()) @map("created_at")
//   updatedAt       DateTime     @default(now()) @updatedAt @map("updated_at")

//   user            User         @relation(fields: [userId], references: [id])
//   items           OrderItem[]

//   @@index([userId])
//   @@index([userId, isCreditOrder])
//   @@index([deliverySlot, status])
//   @@index([isCreditOrder, status])
//   @@index([isCreditOrder, isCreditSettled])
//   @@map("orders")
// }

// model Product {
//   id                  String       @id @default(uuid()) @map("product_id")
//   categoryId          String       @map("category_id")
//   nameAm              String       @map("name_am") @db.VarChar(150)
//   nameOm              String?      @map("name_om") @db.VarChar(150)
//   imageUrl            String       @map("image_url")
//   unitType            UnitType     @default(CARTON) @map("unit_type")
//   pricePerUnit        Decimal      @map("price_per_unit") @db.Decimal(10, 2)
//   allowsHalfCarton    Boolean      @default(false) @map("allows_half_carton")
//   priceHalfCarton     Decimal?     @map("price_half_carton") @db.Decimal(10, 2)
//   minimumOrderQty     Int          @default(1) @map("minimum_order_qty")
//   isFastMoving        Boolean      @default(false) @map("is_fast_moving")
//   hasReturnGuarantee  Boolean      @default(true) @map("has_return_guarantee")

//   // --- Dual Inventory System & Compatibility ---
//   actualStock         Int          @default(50) @map("actual_stock") // Physical warehouse inventory (Admin only)
//   postedStock         Int          @default(50) @map("posted_stock") // Displayed quantity on the mobile app
//   currentStock        Int          @default(50) @map("current_stock") // Preserved for backwards compatibility

//   brand               String?      @default("ቀጥታ ከአምራች ፋብሪካ") @map("brand") @db.VarChar(100)
//   expiryDate          String?      @default("ታኅሣሥ 2027") @map("expiry_date") @db.VarChar(50)
//   isActive            Boolean      @default(true) @map("is_active")
//   createdAt           DateTime     @default(now()) @map("created_at")
//   updatedAt           DateTime     @default(now()) @updatedAt @map("updated_at")

//   category            Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)
//   orderItems          OrderItem[]

//   @@index([categoryId])
//   @@index([isFastMoving])
//   @@map("products")
// }


// model User {
//   id                 String         @id @default(uuid()) @map("user_id")
//   phoneNumber        String         @unique @map("phone_number") @db.VarChar(15)
//   password           String?        // For Admin & Web Portal login (hashed with bcrypt)
//   shopName           String         @map("shop_name") @db.VarChar(150)
//   role               Role           @default(RETAILER)
//   approvalStatus     ApprovalStatus @default(APPROVED) @map("approval_status")
//   creditLimit        Decimal        @default(20000.00) @map("credit_limit") @db.Decimal(10, 2)
//   usedCredit         Decimal        @default(0.00) @map("used_credit") @db.Decimal(10, 2)
//   preferredLanguage  String         @default("am") @map("preferred_language") @db.VarChar(5)
//   gpsLatitude        Decimal?       @map("gps_latitude") @db.Decimal(10, 8)
//   gpsLongitude       Decimal?       @map("gps_longitude") @db.Decimal(11, 8)
//   isActive           Boolean        @default(true) @map("is_active")

//   // --- Dynamic RBAC Permissions ---
//   allowedTabs        String[]       @default(["orders", "products", "credit", "categories", "ads"]) @map("allowed_tabs")

//   createdAt          DateTime       @default(now()) @map("created_at")
//   updatedAt          DateTime       @updatedAt @map("updated_at")

//   orders             Order[]
//   ledgerRecords      LedgerEntry[]

//   @@map("users")
// }

// model OtpVerification {
//   id          String   @id @default(uuid())
//   phoneNumber String   @db.VarChar(15)
//   codeHash    String
//   expiresAt   DateTime
//   verified    Boolean  @default(false)
//   createdAt   DateTime @default(now())

//   @@index([phoneNumber])
//   @@map("otp_verifications")
// }

// model Category {
//   id           String    @id @default(uuid()) @map("category_id")
//   nameAm       String    @map("name_am") @db.VarChar(100)
//   nameOm       String    @map("name_om") @db.VarChar(100)
//   iconUrl      String    @map("icon_url")
//   displayOrder Int       @default(0) @map("display_order")
//   isActive     Boolean   @default(true) @map("is_active")
//   createdAt    DateTime  @default(now()) @map("created_at")
//   updatedAt    DateTime  @default(now()) @updatedAt @map("updated_at")
  
//   products     Product[]

//   @@map("categories")
// }



// // ----------------------------------------------------
// // HOMEPAGE ADS & BANNERS (Image & Video)
// // ----------------------------------------------------

// model Banner {
//   id           String    @id @default(uuid()) @map("banner_id")
//   title        String    @db.VarChar(150)
//   mediaType    MediaType @default(IMAGE) @map("media_type")
//   mediaUrl     String    @map("media_url") // Cloudinary, S3, or local asset URL
//   thumbnailUrl String?   @map("thumbnail_url")
//   actionLink   String?   @map("action_link") // Optional: productId or deep link
//   displayOrder Int       @default(0) @map("display_order")
//   isActive     Boolean   @default(true) @map("is_active")
//   createdAt    DateTime  @default(now()) @map("created_at")
//   updatedAt    DateTime  @updatedAt @map("updated_at")

//   @@map("banners")
// }



// model OrderItem {
//   id           String   @id @default(uuid()) @map("item_id")
//   orderId      String   @map("order_id")
//   productId    String   @map("product_id")
//   quantity     Int
//   selectedUnit UnitType @map("selected_unit")
//   unitPrice    Decimal  @map("unit_price") @db.Decimal(10, 2)

//   order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
//   product      Product  @relation(fields: [productId], references: [id])

//   @@map("order_items")
// }

// // Micro-ERP / Credit Ledger for "የእኔ ሂሳብ"
// model LedgerEntry {
//   id           String     @id @default(uuid())
//   userId       String     @map("user_id")
//   customerName String     @map("customer_name") @db.VarChar(100)
//   amount       Decimal    @db.Decimal(10, 2)
//   type         LedgerType
//   note         String?
//   dueDate      DateTime?  @map("due_date")
//   isSettled    Boolean    @default(false) @map("is_settled")
//   createdAt    DateTime   @default(now()) @map("created_at")

//   user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@index([userId])
//   @@map("ledger_entries")
// }