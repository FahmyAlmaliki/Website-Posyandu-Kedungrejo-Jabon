"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/format";

export interface BabyMeasurementRow {
  id: string;
  batchId?: string;
  sessionId: string | null;
  nama: string | null;
  tanggalLahir: string | null;
  gender: string | null;
  usiaBulan: number | null;
  beratKg: number | null;
  panjangCm: number | null;
  standar: string | null;
  statusPbU: string | null;
  statusBbU: string | null;
  statusBbPb: string | null;
  statusKeseluruhan: string | null;
}

type Tone = "normal" | "warning" | "danger" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  normal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70",
  muted: "bg-slate-100 text-slate-600",
};

function statusTone(text: string | null): Tone {
  if (!text) return "muted";
  const value = text.toLowerCase();
  if (
    value.includes("waspada") ||
    value.includes("risiko") ||
    value.includes("buruk") ||
    value.includes("severely") ||
    value.includes("sangat")
  ) {
    return "danger";
  }
  if (
    value.includes("kurus") ||
    value.includes("wasted") ||
    value.includes("pendek") ||
    value.includes("stunting") ||
    value.includes("obes") ||
    value.includes("gemuk") ||
    value.includes("lebih") ||
    value.includes("overweight") ||
    value.includes("tinggi")
  ) {
    return "warning";
  }
  if (value.includes("normal")) return "normal";
  return "muted";
}

function statusShort(text: string | null): string {
  if (!text) return "-";
  const parts = text.split(/[\u2014\u2013-]/);
  const last = parts[parts.length - 1]?.trim();
  return last && last.length > 0 && last.length <= 30 ? last : text.trim();
}

function StatusBadge({ value }: { value: string | null }) {
  return (
    <span
      className={`badge whitespace-nowrap ${TONE_CLASS[statusTone(value)]}`}
      title={value ?? undefined}
    >
      {statusShort(value)}
    </span>
  );
}

function toCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

interface BabyMeasurementTableProps {
  rows: BabyMeasurementRow[];
  batchTitle?: string;
  batchId?: string;
}

export function BabyMeasurementTable({
  rows,
  batchTitle = "Data Timbangan Bayi",
  batchId,
}: BabyMeasurementTableProps) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [warningOnly, setWarningOnly] = useState(false);

  const genderOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row.gender).filter(Boolean) as string[]),
      ).sort(),
    [rows],
  );

  const stats = useMemo(() => {
    let sumBerat = 0;
    let countBerat = 0;
    let sumPanjang = 0;
    let countPanjang = 0;
    let warning = 0;

    for (const row of rows) {
      if (typeof row.beratKg === "number") {
        sumBerat += row.beratKg;
        countBerat += 1;
      }
      if (typeof row.panjangCm === "number") {
        sumPanjang += row.panjangCm;
        countPanjang += 1;
      }
      const tone = statusTone(row.statusKeseluruhan);
      if (tone === "warning" || tone === "danger") warning += 1;
    }

    return {
      avgBerat: countBerat ? sumBerat / countBerat : null,
      avgPanjang: countPanjang ? sumPanjang / countPanjang : null,
      warning,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (gender !== "all" && row.gender !== gender) return false;
      if (warningOnly) {
        const tone = statusTone(row.statusKeseluruhan);
        if (tone !== "warning" && tone !== "danger") return false;
      }
      if (!q) return true;
      return (
        (row.nama ?? "").toLowerCase().includes(q) ||
        (row.sessionId ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, gender, warningOnly]);

  function handleExport() {
    const header = [
      "session_id",
      "nama",
      "tanggal_lahir",
      "jenis_kelamin",
      "usia_bulan",
      "berat_kg",
      "panjang_cm",
      "standar",
      "status_pb_u",
      "status_bb_u",
      "status_bb_pb",
      "status_keseluruhan",
    ];

    const lines = [header.join(",")];
    for (const row of filteredRows) {
      lines.push(
        [
          row.sessionId,
          row.nama,
          row.tanggalLahir,
          row.gender,
          row.usiaBulan,
          row.beratKg,
          row.panjangCm,
          row.standar,
          row.statusPbU,
          row.statusBbU,
          row.statusBbPb,
          row.statusKeseluruhan,
        ]
          .map(toCsvValue)
          .join(","),
      );
    }

    const blob = new Blob([`\uFEFF${lines.join("\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timbangan-bayi-${batchId ? `batch-${batchId.slice(-6)}-` : ""}${
      Date.now()
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="db-card p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Total Bayi</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {rows.length}
          </p>
        </div>
        <div className="db-card p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Rata-rata Berat</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.avgBerat === null ? "-" : `${formatNumber(stats.avgBerat)} kg`}
          </p>
        </div>
        <div className="db-card p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Rata-rata Panjang</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.avgPanjang === null
              ? "-"
              : `${formatNumber(stats.avgPanjang)} cm`}
          </p>
        </div>
        <div className="db-card p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Perlu Perhatian</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-rose-600 tabular-nums">
            {stats.warning}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="db-card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama bayi atau session ID..."
              className="input-db w-full pl-9"
            />
          </div>

          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="input-db"
          >
            <option value="all">Semua Jenis Kelamin</option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={warningOnly}
              onChange={(event) => setWarningOnly(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Hanya perlu perhatian
          </label>
        </div>

        <button type="button" onClick={handleExport} className="btn-secondary">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="db-card overflow-hidden">
        {filteredRows.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Tidak ada data yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nama Bayi</th>
                  <th className="px-4 py-3">Tgl Lahir</th>
                  <th className="px-4 py-3">JK</th>
                  <th className="px-4 py-3 text-right">Usia (bln)</th>
                  <th className="px-4 py-3 text-right">Berat (kg)</th>
                  <th className="px-4 py-3 text-right">Panjang (cm)</th>
                  <th className="px-4 py-3">Status PB/U</th>
                  <th className="px-4 py-3">Status BB/U</th>
                  <th className="px-4 py-3">Status BB/PB</th>
                  <th className="px-4 py-3">Status Keseluruhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row, index) => (
                  <tr key={row.id} className="transition-colors hover:bg-sky-50/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {row.nama ?? "-"}
                      </div>
                      {row.sessionId && (
                        <div className="font-mono text-[10px] text-slate-400">
                          {row.sessionId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {row.tanggalLahir ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.gender ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(row.usiaBulan, 1)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(row.beratKg)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(row.panjangCm)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.statusPbU} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.statusBbU} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.statusBbPb} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.statusKeseluruhan} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400">
        Menampilkan {filteredRows.length} dari {rows.length} data pada batch{" "}
        <span className="font-semibold text-slate-600">{batchTitle}</span>.
      </p>
    </div>
  );
}
