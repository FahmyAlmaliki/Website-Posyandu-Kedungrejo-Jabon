import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { createBatchFromCsv } from "@/lib/upload-service";

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
      { status: "error", message: "File CSV kosong." },
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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const batch = await createBatchFromCsv({
      buffer,
      filename: file.name || "hasil_pengukuran.csv",
      title,
      source: "DEVICE",
    });

    return NextResponse.json(
      {
        status: "ok",
        message: "Data berhasil diunggah.",
        batchId: batch.id,
        title: batch.title,
        recordCount: batch.recordCount,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat memproses CSV.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }
}
