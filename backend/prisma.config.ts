import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // datasource: {
  //   url: env("DATABASE_URL"),
  // },
  datasource: {
  url: "postgresql://letif:Letif73274465@91.204.209.21:5432/qinash_db",
},
});