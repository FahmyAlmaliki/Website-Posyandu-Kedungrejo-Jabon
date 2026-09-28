import type { Batch } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DeviceType } from "@/lib/device";
import {
  isSupportedUpload,
  parseBabyMeasurementsFile,
  parseMeasurementsFile,
  SUPPORTED_UPLOAD_EXTENSIONS,
} from "@/lib/csv";
import { saveUploadFile } from "@/lib/storage";
import { formatIndonesianDate } from "@/lib/format";

export type UploadSource = "WEB" | "DEVICE";

export interface CreateBatchOptions {
  buffer: Buffer;
  filename: string;
  title?: string | null;
  source: UploadSource;
  deviceType?: DeviceType;
  uploadedAt?: Date;
}

export async function createBatchFromFile(
  options: CreateBatchOptions,
): Promise<Batch> {
  const {
    buffer,
    filename,
    title,
    source,
    deviceType = "VITAL_SIGN",
    uploadedAt,
  } = options;

  if (!isSupportedUpload(filename)) {
    throw new Error(
      `Format berkas tidak didukung. Gunakan salah satu: ${SUPPORTED_UPLOAD_EXTENSIONS.map(
        (ext) => `.${ext}`,
      ).join(", ")}.`,
    );
  }

  const now = uploadedAt ?? new Date();

  if (deviceType === "BABY_SCALE") {
    const rows = parseBabyMeasurementsFile(buffer, filename);
    if (rows.length === 0) {
      throw new Error(
        "Berkas tidak berisi data timbangan bayi yang valid. Pastikan kolom nama, usia_bulan, berat_kg, dan panjang_cm terisi.",
      );
    }

    const saved = await saveUploadFile(buffer, filename);
    const finalTitle =
      title && title.trim().length > 0
        ? title.trim()
        : `Data Timbangan Bayi ${formatIndonesianDate(now)}`;

    return prisma.batch.create({
      data: {
        title: finalTitle,
        source,
        deviceType: "BABY_SCALE",
        uploadedAt: now,
        originalFilename: filename,
        filePath: saved.filePath,
        recordCount: rows.length,
        babyMeasurements: {
          create: rows,
        },
      },
    });
  }

  const rows = parseMeasurementsFile(buffer, filename);
  if (rows.length === 0) {
    throw new Error(
      "Berkas tidak berisi data yang valid. Pastikan baris header sesuai format hasil pengukuran.",
    );
  }

  const saved = await saveUploadFile(buffer, filename);
  const finalTitle =
    title && title.trim().length > 0
      ? title.trim()
      : `Data Vital Sign ${formatIndonesianDate(now)}`;

  return prisma.batch.create({
    data: {
      title: finalTitle,
      source,
      deviceType: "VITAL_SIGN",
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
