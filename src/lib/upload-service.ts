import type { Batch } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseMeasurementsCsv } from "@/lib/csv";
import { saveUploadFile } from "@/lib/storage";
import { formatIndonesianDate } from "@/lib/format";

export type UploadSource = "WEB" | "DEVICE";

export interface CreateBatchOptions {
  buffer: Buffer;
  filename: string;
  title?: string | null;
  source: UploadSource;
  uploadedAt?: Date;
}

export async function createBatchFromCsv(
  options: CreateBatchOptions,
): Promise<Batch> {
  const { buffer, filename, title, source, uploadedAt } = options;

  const rows = parseMeasurementsCsv(buffer.toString("utf8"));
  if (rows.length === 0) {
    throw new Error(
      "CSV tidak berisi data yang valid. Pastikan baris header sesuai format hasil pengukuran.",
    );
  }

  const saved = await saveUploadFile(buffer, filename);
  const now = uploadedAt ?? new Date();
  const finalTitle =
    title && title.trim().length > 0
      ? title.trim()
      : `Data Vital Sign ${formatIndonesianDate(now)}`;

  return prisma.batch.create({
    data: {
      title: finalTitle,
      source,
      uploadedAt: now,
      originalFilename: filename,
      filePath: saved.filePath,
      recordCount: rows.length,
      measurements: {
        create: rows,
      },
    },
  });
}
