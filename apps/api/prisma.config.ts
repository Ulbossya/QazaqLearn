import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const rootEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../.env");
if (existsSync(rootEnvPath)) process.loadEnvFile(rootEnvPath);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node prisma/seed.ts"
  }
});
