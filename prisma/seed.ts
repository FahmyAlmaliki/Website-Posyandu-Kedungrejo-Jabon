import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { parseMeasurementsCsv } from "../src/lib/csv";
import { saveUploadFile } from "../src/lib/storage";

const prisma = new PrismaClient();

const SEED_CSV = "hasil_pengukuran.csv";
const SEED_TITLE = "Data Vital Sign 11 September 2026";

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash },
  });
  console.log(`[seed] Akun admin siap: ${username}`);

  const existingBatches = await prisma.batch.count();
  if (existingBatches > 0) {
    console.log(
      `[seed] ${existingBatches} batch sudah ada. Lewati impor CSV awal.`,
    );
    return;
  }

  const csvPath = path.join(process.cwd(), SEED_CSV);
  try {
    const buffer = await readFile(csvPath);
    const rows = parseMeasurementsCsv(buffer.toString("utf8"));

    if (rows.length === 0) {
      console.warn("[seed] CSV awal tidak berisi data valid.");
      return;
    }

    const saved = await saveUploadFile(buffer, SEED_CSV);
    const batch = await prisma.batch.create({
      data: {
        title: SEED_TITLE,
        source: "DEVICE",
        originalFilename: SEED_CSV,
        filePath: saved.filePath,
        recordCount: rows.length,
        measurements: { create: rows },
      },
    });

    console.log(
      `[seed] Import ${rows.length} data sebagai kartu "${batch.title}".`,
    );
  } catch (error) {
    console.warn(
      `[seed] Gagal impor CSV awal (${SEED_CSV}):`,
      error instanceof Error ? error.message : error,
    );
  }
}

main()
  .catch((error) => {
    console.error("[seed] Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
