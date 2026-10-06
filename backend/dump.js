// dump.js
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');

// Replace this string with your exact local connection URL directly
const LOCAL_URL = "postgresql://postgres:Letif7327@localhost:5432/b2b_retail_db?schema=public"

const pool = new Pool({ connectionString: LOCAL_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('📦 Exporting local database records...');
  const data = {
    users: await prisma.user.findMany(),
    categories: await prisma.category.findMany(),
    products: await prisma.product.findMany(),
    orders: await prisma.order.findMany({ include: { items: true } }),
  };
  
  fs.writeFileSync('local_backup.json', JSON.stringify(data, null, 2));
  console.log('✅ Success! local_backup.json has been created.');
}

main()
  .catch((e) => console.error('Dump error:', e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });