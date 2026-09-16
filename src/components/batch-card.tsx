import Link from "next/link";
import type { Batch } from "@prisma/client";
import { formatIndonesianDateTime } from "@/lib/format";

const SOURCE_LABEL: Record<string, string> = {
  WEB: "Website",
  DEVICE: "Alat Vital Sign",
};

export function BatchCard({ batch }: { batch: Batch }) {
  const isDevice = batch.source === "DEVICE";

  return (
    <Link
      href={`/batch/${batch.id}`}
      className="card-cloud card-cloud-hover group flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
            isDevice
              ? "bg-gradient-to-br from-sky-100 to-blue-100 text-blue-700"
              : "bg-gradient-to-br from-indigo-100 to-sky-100 text-indigo-700"
          }`}
          aria-hidden
        >
          {isDevice ? "🩺" : "📄"}
        </span>
        <span
          className={`badge ${
            isDevice
              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
              : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
          }`}
        >
          {SOURCE_LABEL[batch.source] ?? batch.source}
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-blue-900 transition group-hover:text-blue-700">
          {batch.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {formatIndonesianDateTime(batch.uploadedAt)}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-sky-50 pt-3">
        <span className="text-sm text-slate-600">
          <strong className="font-semibold text-blue-800">
            {batch.recordCount}
          </strong>{" "}
          data
        </span>
        <span className="text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
          Lihat data →
        </span>
      </div>
    </Link>
  );
}
