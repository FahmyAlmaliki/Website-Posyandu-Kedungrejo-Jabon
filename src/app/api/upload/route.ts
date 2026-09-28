import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createBatchFromFile } from "@/lib/upload-service";
import { normalizeDeviceType } from "@/lib/device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { status: "error", message: "Anda harus login sebagai admin." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Body harus multipart/form-data." },
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
  const deviceType = normalizeDeviceType(formData.get("device_type"));

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const batch = await createBatchFromFile({
      buffer,
      filename: file.name || "hasil_pengukuran.csv",
      title,
      source: "WEB",
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
