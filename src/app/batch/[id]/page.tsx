import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { MeasurementTable } from "@/components/measurement-table";
import { DeleteBatchButton } from "@/components/delete-batch-button";
import { formatIndonesianDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, { label: string; badgeClass: string }> = {
  WEB: {
    label: "Web Upload (Admin)",
    badgeClass: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
  },
  DEVICE: {
    label: "Alat Vital Sign (Hardware)",
    badgeClass: "bg-teal-50 text-teal-700 ring-1 ring-teal-200/60",
  },
};

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, batch] = await Promise.all([
    auth(),
    prisma.batch.findUnique({
      where: { id },
      include: { measurements: { orderBy: { nama: "asc" } } },
    }),
  ]);

  if (!batch) {
    notFound();
  }

  const isAdmin = Boolean(session?.user);
  const sourceInfo = SOURCE_LABEL[batch.source] ?? {
    label: batch.source,
    badgeClass: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link
          href="/"
          className="hover:text-slate-900 transition flex items-center gap-1"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Dashboard Registri</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-400">batch-{batch.id.slice(-6)}</span>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{batch.title}</span>
      </nav>

      {/* Batch Header & Metadata Bar */}
      <section className="db-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${sourceInfo.badgeClass}`}>
                {sourceInfo.label}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                ID: {batch.id}
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {batch.title}
            </h1>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Waktu Unggah: <strong>{formatIndonesianDateTime(batch.uploadedAt)}</strong></span>
              <span>•</span>
              <span>File Sumber: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">{batch.originalFilename}</code></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-2 border border-slate-100">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Rekor</p>
                <p className="text-lg font-extrabold text-slate-900 tabular-nums leading-none mt-0.5">
                  {batch.recordCount} <span className="text-xs font-normal text-slate-500">balita</span>
                </p>
              </div>
            </div>

            {isAdmin && (
              <DeleteBatchButton
                batchId={batch.id}
                batchTitle={batch.title}
                redirectTo="/"
                variant="solid"
              />
            )}
          </div>
        </div>
      </section>

      {/* Measurement Table Component */}
      <MeasurementTable
        rows={batch.measurements}
        batchTitle={batch.title}
        batchId={batch.id}
      />
    </div>
  );
}
