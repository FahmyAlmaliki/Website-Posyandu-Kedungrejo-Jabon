import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { createBatchFromFile } from "@/lib/upload-service";
import { normalizeDeviceType } from "@/lib/device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!verifyApiKey(apiKey)) {
    return NextResponse.json(
      { status: "error", message: "API key tidak valid atau tidak dikirim." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Body harus multipart/form-data dengan field 'file'.",
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { status: "error", message: "Field 'file' wajib diisi." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { status: "error", message: "Berkas kosong." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { status: "error", message: "Ukuran file melebihi 10 MB." },
      { status: 413 },
    );
  }

  const titleValue = formData.get("title");
  const title = typeof titleValue === "string" ? titleValue : null;

  const deviceTypeValue =
    formData.get("device_type") ??
    request.nextUrl.searchParams.get("device_type");
  const deviceType = normalizeDeviceType(deviceTypeValue);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const batch = await createBatchFromFile({
      buffer,
      filename: file.name || "hasil_pengukuran.csv",
      title,
      source: "DEVICE",
      deviceType,
    });

    return NextResponse.json(
      {
        status: "ok",
        message: "Data berhasil diunggah.",
        batchId: batch.id,
        title: batch.title,
        recordCount: batch.recordCount,
        deviceType: batch.deviceType,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat memproses berkas.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }
}
