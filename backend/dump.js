// // dump.js
// const { PrismaClient } = require('@prisma/client');
// const { Pool } = require('pg');
// const { PrismaPg } = require('@prisma/adapter-pg');
// const fs = require('fs');

// // Replace this string with your exact local connection URL directly
// const LOCAL_URL = "postgresql://postgres:Letif7327@localhost:5432/b2b_retail_db?schema=public"

// const pool = new Pool({ connectionString: LOCAL_URL });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log('📦 Exporting local database records...');
//   const data = {
//     users: await prisma.user.findMany(),
//     categories: await prisma.category.findMany(),
//     products: await prisma.product.findMany(),
//     orders: await prisma.order.findMany({ include: { items: true } }),
//   };
  
//   fs.writeFileSync('local_backup.json', JSON.stringify(data, null, 2));
//   console.log('✅ Success! local_backup.json has been created.');
// }

// main()
//   .catch((e) => console.error('Dump error:', e))
//   .finally(async () => {
//     await prisma.$disconnect();
//     await pool.end();
//   });
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_Im1ByUC6NhwM@ep-odd-hat-b5rioeon-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

async function exportDb() {
  try {
    await client.connect();
    console.log("Connected to Neon database...");

    // Get all table names
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_type='BASE TABLE';
    `);

    let backupSQL = "-- Neon Database Backup\n\n";

    for (let row of res.rows) {
      const tableName = row.table_name;
      console.log(`Exporting table: ${tableName}`);
      
      const dataRes = await client.query(`SELECT * FROM "${tableName}"`);
      
      if (dataRes.rows.length > 0) {
        const columns = Object.keys(dataRes.rows[0]).map(c => `"${c}"`).join(', ');
        for (let r of dataRes.rows) {
          const values = Object.values(r).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'object') return `'${JSON.stringify(val)}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');

          backupSQL += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
        }
      }
    }

    fs.writeFileSync('neon_backup.sql', backupSQL);
    console.log("Backup successfully generated as 'neon_backup.sql'!");
  } catch (err) {
    console.error("Error exporting database:", err);
  } finally {
    await client.end();
  }
}

exportDb();