import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BatchCard } from "@/components/batch-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const batches = await prisma.batch.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const totalRecords = batches.reduce(
    (total, batch) => total + batch.recordCount,
    0,
  );

  return (
    <div className="space-y-8">
      <section className="animate-fade-up overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-7 shadow-cloud sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
          Sistem Informasi Posyandu
        </p>
        <h1 className="mt-2 text-2xl font-bold text-blue-900 sm:text-3xl">
          Data Pengukuran Vital Sign
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Kumpulan hasil pengukuran balita dari alat Vital Sign. Pilih salah satu
          kartu di bawah untuk melihat tabel data dan mencari nama.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-500">Total Upload</p>
            <p className="text-xl font-bold text-blue-800">{batches.length}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-500">Total Data</p>
            <p className="text-xl font-bold text-blue-800">{totalRecords}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-blue-900">Daftar Data</h2>
          <span className="text-xs text-slate-500">
            {batches.length} kartu
          </span>
        </div>

        {batches.length === 0 ? (
          <div className="card-cloud flex flex-col items-center justify-center gap-2 p-12 text-center">
            <span className="text-4xl">☁️</span>
            <p className="font-semibold text-blue-900">Belum ada data</p>
            <p className="max-w-sm text-sm text-slate-500">
              Upload file CSV hasil pengukuran melalui halaman admin, atau kirim
              dari alat Vital Sign menggunakan API.
            </p>
            <Link href="/upload" className="btn-primary mt-3">
              Upload CSV
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
