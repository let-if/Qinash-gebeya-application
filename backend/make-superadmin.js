const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      phoneNumber: { in: ['0911000000', '+251911000000'] },
    },
    data: {
      role: 'SUPERADMIN',
      allowedTabs: ['orders', 'credit', 'products', 'categories', 'ads', 'users'],
    },
  });

  console.log(`Updated ${result.count} user(s) to SUPERADMIN.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());