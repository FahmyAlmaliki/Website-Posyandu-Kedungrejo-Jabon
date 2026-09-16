import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UploadForm } from "./upload-form";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Upload Data CSV</h1>
        <p className="mt-1 text-sm text-slate-600">
          Unggah file CSV hasil pengukuran. Setiap file akan menjadi satu kartu
          data.
        </p>
      </div>

      <div className="animate-fade-up rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-cloud backdrop-blur sm:p-8">
        <UploadForm />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-sm">
        <p className="font-semibold text-blue-900">
          Upload otomatis dari alat Vital Sign
        </p>
        <p className="mt-1 text-slate-600">
          Alat dapat mengirim CSV langsung via API tanpa login website:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-blue-900/95 p-4 text-xs leading-relaxed text-sky-100">
{`POST /api/v1/measurements/upload
Header: X-API-Key: <DEVICE_API_KEY>
Body  : multipart/form-data
        - file  : file CSV hasil pengukuran
        - title : (opsional) judul kartu`}
        </pre>
        <p className="mt-2 text-xs text-slate-500">
          Contoh program Python tersedia pada folder{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-blue-700">
            examples/device
          </code>
          .
        </p>
      </div>
    </div>
  );
}
