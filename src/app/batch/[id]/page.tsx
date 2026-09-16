import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeasurementTable } from "@/components/measurement-table";
import { formatIndonesianDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  WEB: "Upload Website",
  DEVICE: "Alat Vital Sign",
};

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: { measurements: { orderBy: { nama: "asc" } } },
  });

  if (!batch) {
    notFound();
  }

  const isDevice = batch.source === "DEVICE";

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 transition hover:text-blue-800"
      >
        ← Kembali ke daftar
      </Link>

      <section className="animate-fade-up rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-cloud sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={`badge ${
                isDevice
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                  : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
              }`}
            >
              {SOURCE_LABEL[batch.source] ?? batch.source}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-blue-900">
              {batch.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Diunggah {formatIndonesianDateTime(batch.uploadedAt)} •{" "}
              {batch.originalFilename}
            </p>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-3 text-center shadow-sm">
            <p className="text-xs text-slate-500">Jumlah Data</p>
            <p className="text-2xl font-bold text-blue-800">
              {batch.recordCount}
            </p>
          </div>
        </div>
      </section>

      <MeasurementTable rows={batch.measurements} />
    </div>
  );
}
