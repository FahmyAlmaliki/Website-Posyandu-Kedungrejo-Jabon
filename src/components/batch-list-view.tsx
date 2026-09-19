"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Batch } from "@prisma/client";
import { formatIndonesianDateTime } from "@/lib/format";
import { BatchCard } from "@/components/batch-card";
import { DeleteBatchButton } from "@/components/delete-batch-button";

interface BatchListViewProps {
  batches: Batch[];
  isAdmin: boolean;
}

export function BatchListView({ batches, isAdmin }: BatchListViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "DEVICE" | "WEB">("ALL");

  const filteredBatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return batches.filter((b) => {
      if (sourceFilter !== "ALL" && b.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.originalFilename.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [batches, query, sourceFilter]);

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="db-card p-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul batch atau file CSV..."
              className="input-db w-full pl-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Source Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSourceFilter("ALL")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                sourceFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({batches.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("DEVICE")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                sourceFilter === "DEVICE"
                  ? "bg-white text-teal-800 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Alat Vital Sign
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("WEB")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                sourceFilter === "WEB"
                  ? "bg-white text-indigo-800 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Web Upload
            </button>
          </div>
        </div>

        {/* View Switcher: Table vs Card */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-slate-500 hidden md:inline">
            Tampilan:
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Tampilan Tabel Database"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              title="Tampilan Kartu"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "card"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredBatches.length === 0 ? (
        <div className="db-card flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="mt-3 font-semibold text-slate-800 text-sm">
            Tidak ada batch yang cocok
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Coba ubah kata kunci pencarian atau ganti filter sumber data di atas.
          </p>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSourceFilter("ALL");
              }}
              className="btn-secondary mt-3"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* Database Table Mode */
        <div className="db-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Judul Sesi / Batch</th>
                  <th className="px-4 py-3">Sumber Data</th>
                  <th className="px-4 py-3 text-right">Jumlah Data</th>
                  <th className="px-4 py-3">Waktu Diunggah</th>
                  <th className="px-4 py-3">Nama File CSV</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBatches.map((batch, index) => {
                  const isDevice = batch.source === "DEVICE";
                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-sky-50/40 transition-colors group"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/batch/${batch.id}`}
                          className="font-bold text-slate-900 group-hover:text-sky-600 transition"
                        >
                          {batch.title}
                        </Link>
                        <div className="text-[10px] font-mono text-slate-400">
                          ID: {batch.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            isDevice
                              ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200/70"
                              : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70"
                          }`}
                        >
                          {isDevice ? "Alat Vital Sign" : "Web Upload"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {batch.recordCount}
                        </span>
                        <span className="text-slate-400 text-[11px]"> balita</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {formatIndonesianDateTime(batch.uploadedAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 max-w-[180px] truncate">
                        {batch.originalFilename}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/batch/${batch.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                          >
                            <span>Buka Data</span>
                            <span>→</span>
                          </Link>
                          {isAdmin && (
                            <DeleteBatchButton
                              batchId={batch.id}
                              batchTitle={batch.title}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredBatches.length}</strong> dari {batches.length} batch terdaftar
            </span>
            <span className="text-[11px] text-slate-400">
              Terakhir dimutakhirkan: {formatIndonesianDateTime(new Date())}
            </span>
          </div>
        </div>
      ) : (
        /* Card Mode */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
