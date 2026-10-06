// restore.js
const { PrismaClient } = require('@prisma/client'); // <-- Updated to standard package import
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');

const NEON_URL = "postgresql://neondb_owner:npg_Im1ByUC6NhwM@ep-odd-hat-b5rioeon-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString: NEON_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const data = JSON.parse(fs.readFileSync('local_backup.json', 'utf8'));

  if (data.users && data.users.length > 0) {
    for (const u of data.users) {
      await prisma.user.upsert({ where: { id: u.id }, update: u, create: u });
    }
    console.log(`✅ Restored ${data.users.length} users.`);
  }

  if (data.categories && data.categories.length > 0) {
    for (const c of data.categories) {
      await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
    }
    console.log(`✅ Restored ${data.categories.length} categories.`);
  }

  if (data.products && data.products.length > 0) {
    for (const p of data.products) {
      await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
    }
    console.log(`✅ Restored ${data.products.length} products.`);
  }

  if (data.orders && data.orders.length > 0) {
    for (const o of data.orders) {
      const { items, ...orderData } = o;
      await prisma.order.upsert({ where: { id: orderData.id }, update: orderData, create: orderData });
      if (items && items.length > 0) {
        for (const it of items) {
          await prisma.orderItem.upsert({ where: { id: it.id }, update: it, create: it });
        }
      }
    }
    console.log(`✅ Restored ${data.orders.length} orders with items.`);
  }

  console.log('🎉 All local data restored to Neon successfully!');
}

main()
  .catch((e) => {
    console.error('Restore error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });