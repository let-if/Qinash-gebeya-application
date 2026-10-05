require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import your project's existing configured prisma client
// If your prisma instance is in src/lib/prisma, adjust the path:
let prisma;
try {
  prisma = require('./src/lib/prisma').default || require('./src/lib/prisma');
} catch (e) {
  try {
    prisma = require('./src/db').default || require('./src/db');
  } catch (err) {
    const { PrismaClient } = require('@prisma/client');
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
}

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '0911000000' },
    update: { 
      role: 'ADMIN', 
      password: hash, 
      approvalStatus: 'APPROVED' 
    },
    create: {
      phoneNumber: '0911000000',
      password: hash,
      shopName: 'Qinash Gebeya Central HQ',
      role: 'ADMIN',
      approvalStatus: 'APPROVED',
    },
  });

  console.log('✅ Admin initialized successfully!');
  console.log('Phone:', admin.phoneNumber);
  console.log('Password: admin123');
  console.log('Role:', admin.role);
}

main()
  .catch((e) => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma?.$disconnect) {
      await prisma.$disconnect();
    }
  });