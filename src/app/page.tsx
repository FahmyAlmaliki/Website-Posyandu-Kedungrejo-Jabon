import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BatchListView } from "@/components/batch-list-view";
import { formatIndonesianDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const isAdmin = Boolean(session?.user);

  const batches = await prisma.batch.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const totalRecords = batches.reduce(
    (total, batch) => total + batch.recordCount,
    0,
  );

  const deviceBatches = batches.filter((b) => b.source === "DEVICE").length;
  const webBatches = batches.filter((b) => b.source === "WEB").length;
  const latestBatch = batches[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <section className="db-card overflow-hidden border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-sky-50 text-sky-700 ring-1 ring-sky-200/60">
                Sistem Registri Balita
              </span>
              <span className="text-xs text-slate-400">Desa Kedungrejo</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Basis Data Pengukuran Vital Sign
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              Registri penyimpanan dan penelusuran hasil pemeriksaan tanda vital
              balita (Suhu, Detak Jantung, Saturasi Oksigen, Glukosa, dan Antropometri).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <Link href="/upload" className="btn-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload Batch CSV</span>
              </Link>
            ) : (
              <Link href="/login" className="btn-secondary">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Login Petugas / Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* KPI Stat Grid with Professional SVG Icons */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-5 border-t border-slate-100">
          <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-500">Total Data Balita</p>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totalRecords}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Rekor tersimpan</p>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-500">Total Batch Data</p>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {batches.length}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sesi pemeriksaan</p>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-500">Sumber Data</p>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 text-teal-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-bold text-teal-700">{deviceBatches} Alat</span>
              <span className="text-xs text-slate-300">/</span>
              <span className="text-sm font-bold text-indigo-700">{webBatches} Web</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Metode transmisi</p>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3.5 border border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-500">Aktivitas Terakhir</p>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-slate-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1">
              {latestBatch ? formatIndonesianDateTime(latestBatch.uploadedAt) : "-"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {latestBatch ? latestBatch.title : "Belum ada data"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Database Registry List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Koleksi Batch Pengukuran
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {batches.length}
            </span>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="db-card flex flex-col items-center justify-center gap-2 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800 mt-2">Basis Data Masih Kosong</p>
            <p className="max-w-sm text-xs text-slate-500">
              Belum ada data pengukuran yang diunggah. Silakan upload file CSV hasil
              pengukuran atau hubungkan alat Vital Sign via REST API.
            </p>
            <Link href="/upload" className="btn-primary mt-3">
              Upload Data Sekarang
            </Link>
          </div>
        ) : (
          <BatchListView batches={batches} isAdmin={isAdmin} />
        )}
      </section>
    </div>
  );
}
