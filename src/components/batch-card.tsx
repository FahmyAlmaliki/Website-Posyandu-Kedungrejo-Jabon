import Link from "next/link";
import type { Batch } from "@prisma/client";
import { formatIndonesianDateTime } from "@/lib/format";
import { DeleteBatchButton } from "@/components/delete-batch-button";

const SOURCE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; iconType: "device" | "web" }
> = {
  WEB: {
    label: "Web Upload",
    badgeClass: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
    iconType: "web",
  },
  DEVICE: {
    label: "Alat Vital Sign",
    badgeClass: "bg-teal-50 text-teal-700 ring-1 ring-teal-200/60",
    iconType: "device",
  },
};

interface BatchCardProps {
  batch: Batch;
  isAdmin?: boolean;
}

export function BatchCard({ batch, isAdmin = false }: BatchCardProps) {
  const sourceInfo = SOURCE_CONFIG[batch.source] ?? {
    label: batch.source,
    badgeClass: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    iconType: "web",
  };

  return (
    <div className="group relative flex flex-col justify-between db-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${
                sourceInfo.iconType === "device"
                  ? "bg-teal-50 text-teal-700 ring-teal-200/70"
                  : "bg-indigo-50 text-indigo-700 ring-indigo-200/70"
              }`}
              aria-hidden
            >
              {sourceInfo.iconType === "device" ? (
                /* Medical Stethoscope / Device SVG */
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              ) : (
                /* File Document CSV SVG */
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </span>
            <span className={`badge ${sourceInfo.badgeClass}`}>
              {sourceInfo.label}
            </span>
          </div>

          {isAdmin && (
            <div className="opacity-80 transition-opacity hover:opacity-100">
              <DeleteBatchButton batchId={batch.id} batchTitle={batch.title} />
            </div>
          )}
        </div>

        <div className="mt-3.5">
          <Link
            href={`/batch/${batch.id}`}
            className="text-sm font-bold text-slate-900 transition hover:text-sky-600 line-clamp-1"
          >
            {batch.title}
          </Link>
          <p className="mt-1 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <svg
              className="h-3 w-3 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatIndonesianDateTime(batch.uploadedAt)}
          </p>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">File Sumber:</span>
            <span className="font-mono text-slate-700 truncate max-w-[140px]" title={batch.originalFilename}>
              {batch.originalFilename}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 tabular-nums">
            {batch.recordCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">data terdata</span>
        </div>

        <Link
          href={`/batch/${batch.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 transition group-hover:text-sky-700 group-hover:translate-x-0.5"
        >
          <span>Buka Data</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
