import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { UploadForm } from "./upload-form";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Dashboard Registri</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Upload Data CSV</span>
      </nav>

      <div>
        <div className="flex items-center gap-2">
          <span className="badge bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60">
            Ingestion Console
          </span>
          <span className="text-xs text-slate-400">Database Balita</span>
        </div>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
          Upload Hasil Pengukuran Vital Sign
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Impor file CSV hasil perekaman data dari alat pengukur Vital Sign ke dalam basis data posyandu.
        </p>
      </div>

      <div className="db-card p-6 sm:p-7">
        <UploadForm />
      </div>

      {/* Hardware / API Integration Info */}
      <div className="db-card p-5 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Pengiriman Otomatis dari Alat Vital Sign (Hardware)
          </h3>
        </div>
        <p className="mt-1.5 text-xs text-slate-600">
          Alat mikrokontroler/Raspberry Pi dapat mengirimkan hasil pengukuran secara otomatis melalui antarmuka REST API tanpa perlu unggah manual via browser:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed text-sky-200">
{`POST /api/v1/measurements/upload
Header: X-API-Key: <DEVICE_API_KEY>
Content-Type: multipart/form-data
  - file  : [file_pengukuran.csv]
  - title : (opsional) Judul sesi pemeriksaan`}
        </pre>
        <p className="mt-2 text-[11px] text-slate-500">
          Dokumentasi dan skrip integrasi Python tersedia pada direktori{" "}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-sky-700 border border-slate-200">
            examples/device
          </code>
          .
        </p>
      </div>
    </div>
  );
}
