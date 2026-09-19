"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/format";

export interface MeasurementRow {
  id: string;
  batchId?: string;
  sessionId: string | null;
  nama: string | null;
  tanggalLahir: string | null;
  umurBulan: number | null;
  gender: string | null;
  kategoriTinggi: string | null;
  tinggiCm: number | null;
  beratKg: number | null;
  suhuC: number | null;
  hrBpm: number | null;
  spo2Pct: number | null;
  glukosaMgdl: number | null;
  glukosaStatus: string | null;
  fsRedirHz?: number | null;
  fsGreenHz?: number | null;
  fsResampleHz?: number | null;
  fsKualitasOk?: boolean | null;
  durasiKualitasOk?: boolean | null;
  nSamplePpg?: number | null;
}

type SortKey =
  | "nama"
  | "umurBulan"
  | "tinggiCm"
  | "beratKg"
  | "suhuC"
  | "hrBpm"
  | "spo2Pct"
  | "glukosaMgdl";

function glucoseLabel(status: string | null): string {
  if (!status) return "-";
  const lower = status.toLowerCase();
  if (lower.startsWith("ok")) return "Normal";
  if (lower.includes("tinggi") || lower.includes("high")) return "Tinggi";
  if (lower.includes("rendah") || lower.includes("low")) return "Rendah";
  return status.split(":")[0].trim().slice(0, 14) || "-";
}

function glucoseBadgeClass(status: string | null): string {
  const label = glucoseLabel(status);
  if (label === "Normal")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70";
  if (label === "Tinggi")
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70";
  if (label === "Rendah")
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70";
  return "bg-slate-100 text-slate-600";
}

function toCsvValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

interface MeasurementTableProps {
  rows: MeasurementRow[];
  batchTitle?: string;
  batchId?: string;
}

export function MeasurementTable({
  rows,
  batchTitle = "Data Pengukuran",
  batchId,
}: MeasurementTableProps) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [kategori, setKategori] = useState("all");
  const [glucoseFilter, setGlucoseFilter] = useState("all");
  const [alertOnly, setAlertOnly] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<SortKey>("nama");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MeasurementRow | null>(null);

  // Dynamic filter options
  const genderOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row.gender).filter(Boolean) as string[]),
      ).sort(),
    [rows],
  );

  const kategoriOptions = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map((row) => row.kategoriTinggi).filter(Boolean) as string[],
        ),
      ).sort(),
    [rows],
  );

  // Aggregate stats calculations for the batch
  const stats = useMemo(() => {
    if (rows.length === 0) {
      return { avgAge: 0, avgSuhu: 0, avgHr: 0, avgSpo2: 0, alertCount: 0 };
    }
    let sumAge = 0,
      countAge = 0;
    let sumSuhu = 0,
      countSuhu = 0;
    let sumHr = 0,
      countHr = 0;
    let sumSpo2 = 0,
      countSpo2 = 0;
    let alerts = 0;

    for (const r of rows) {
      if (typeof r.umurBulan === "number") {
        sumAge += r.umurBulan;
        countAge++;
      }
      if (typeof r.suhuC === "number") {
        sumSuhu += r.suhuC;
        countSuhu++;
        if (r.suhuC > 37.5 || r.suhuC < 36.0) alerts++;
      }
      if (typeof r.hrBpm === "number") {
        sumHr += r.hrBpm;
        countHr++;
      }
      if (typeof r.spo2Pct === "number") {
        sumSpo2 += r.spo2Pct;
        countSpo2++;
        if (r.spo2Pct < 95) alerts++;
      }
      const g = glucoseLabel(r.glukosaStatus);
      if (g === "Tinggi" || g === "Rendah") alerts++;
    }

    return {
      avgAge: countAge ? sumAge / countAge : 0,
      avgSuhu: countSuhu ? sumSuhu / countSuhu : 0,
      avgHr: countHr ? sumHr / countHr : 0,
      avgSpo2: countSpo2 ? sumSpo2 / countSpo2 : 0,
      alertCount: alerts,
    };
  }, [rows]);

  // Filtering & Sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = rows.filter((row) => {
      if (q) {
        const matchesName = (row.nama ?? "").toLowerCase().includes(q);
        const matchesSession = (row.sessionId ?? "").toLowerCase().includes(q);
        const matchesDob = (row.tanggalLahir ?? "").toLowerCase().includes(q);
        if (!matchesName && !matchesSession && !matchesDob) return false;
      }

      if (gender !== "all" && row.gender !== gender) return false;
      if (kategori !== "all" && row.kategoriTinggi !== kategori) return false;

      if (glucoseFilter !== "all") {
        const gLabel = glucoseLabel(row.glukosaStatus);
        if (glucoseFilter === "normal" && gLabel !== "Normal") return false;
        if (glucoseFilter === "tinggi" && gLabel !== "Tinggi") return false;
        if (glucoseFilter === "rendah" && gLabel !== "Rendah") return false;
      }

      if (alertOnly) {
        const isFever = typeof row.suhuC === "number" && (row.suhuC > 37.5 || row.suhuC < 36.0);
        const isLowSpo2 = typeof row.spo2Pct === "number" && row.spo2Pct < 95;
        const gLabel = glucoseLabel(row.glukosaStatus);
        const isAbnormalGlucose = gLabel === "Tinggi" || gLabel === "Rendah";
        if (!isFever && !isLowSpo2 && !isAbnormalGlucose) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "id");
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [rows, query, gender, kategori, glucoseFilter, alertOnly, sortKey, sortAsc]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    if (pageSize === 0) return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function exportCsv() {
    const headers = [
      "session_id",
      "nama",
      "tanggal_lahir",
      "umur_bulan",
      "gender",
      "kategori_tinggi",
      "tinggi_cm",
      "berat_kg",
      "suhu_c",
      "hr_bpm",
      "spo2_pct",
      "glukosa_mgdl",
      "glukosa_status",
      "fs_redir_hz",
      "fs_green_hz",
      "fs_resample_hz",
      "fs_kualitas_ok",
      "durasi_kualitas_ok",
      "n_sample_ppg",
    ];
    const lines = [headers.join(",")];
    for (const row of filtered) {
      lines.push(
        [
          row.sessionId,
          row.nama,
          row.tanggalLahir,
          row.umurBulan,
          row.gender,
          row.kategoriTinggi,
          row.tinggiCm,
          row.beratKg,
          row.suhuC,
          row.hrBpm,
          row.spo2Pct,
          row.glukosaMgdl,
          row.glukosaStatus,
          row.fsRedirHz,
          row.fsGreenHz,
          row.fsResampleHz,
          row.fsKualitasOk,
          row.durasiKualitasOk,
          row.nSamplePpg,
        ]
          .map(toCsvValue)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registri-posyandu-${batchId ? `batch-${batchId.slice(-6)}-` : ""}${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return (
        <span className="text-slate-300 group-hover:text-slate-500 transition">
          ↕
        </span>
      );
    }
    return (
      <span className="text-sky-600 font-bold">
        {sortAsc ? "▲" : "▼"}
      </span>
    );
  };

  const isCompact = density === "compact";
  const cellPadding = isCompact ? "px-3 py-1.5" : "px-3.5 py-2.5";

  return (
    <div className="space-y-4">
      {/* Batch Health Metrics Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 db-card p-3 bg-slate-50/70 border-slate-200">
        <div className="p-2 border-r border-slate-200/60 last:border-none">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Total Baris</p>
          <p className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
            {rows.length} <span className="text-xs font-normal text-slate-500">balita</span>
          </p>
        </div>
        <div className="p-2 border-r border-slate-200/60 last:border-none">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Rerata Umur</p>
          <p className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
            {formatNumber(stats.avgAge, 1)} <span className="text-xs font-normal text-slate-500">bln</span>
          </p>
        </div>
        <div className="p-2 border-r border-slate-200/60 last:border-none">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Rerata Suhu</p>
          <p className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
            {formatNumber(stats.avgSuhu, 1)}°C
          </p>
        </div>
        <div className="p-2 border-r border-slate-200/60 last:border-none">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Rerata Detak Nadi</p>
          <p className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
            {formatNumber(stats.avgHr, 0)} <span className="text-xs font-normal text-slate-500">bpm</span>
          </p>
        </div>
        <div className="p-2 col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Perhatian Klinis</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`badge ${
                stats.alertCount > 0
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                  : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
              }`}
            >
              {stats.alertCount > 0 ? (
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{stats.alertCount} Indikasi</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Semua Optimal</span>
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Database Controls Toolbar */}
      <div className="db-card p-3.5 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box & Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, session ID, tgl lahir..."
                className="input-db w-full pl-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setCurrentPage(1);
              }}
              className="input-db text-xs"
            >
              <option value="all">Semua Gender</option>
              {genderOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="input-db text-xs"
            >
              <option value="all">Semua Kategori</option>
              {kategoriOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={glucoseFilter}
              onChange={(e) => {
                setGlucoseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-db text-xs"
            >
              <option value="all">Semua Status Glukosa</option>
              <option value="normal">Glukosa Normal</option>
              <option value="tinggi">Glukosa Tinggi</option>
              <option value="rendah">Glukosa Rendah</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setAlertOnly((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                alertOnly
                  ? "bg-amber-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Perlu Perhatian</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 lg:border-t-0 lg:pt-0">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setDensity("comfortable")}
                title="Kepadatan Normal"
                className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                  density === "comfortable"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                title="Kepadatan Padat (Database Pro)"
                className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                  density === "compact"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Kompak
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary text-xs"
              title="Cetak Laporan Registry"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="btn-primary text-xs"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="db-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100/95 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <th className={`${cellPadding} text-center w-12`}>No</th>
                <th className={`${cellPadding}`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("nama")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase"
                  >
                    <span>Nama Balita</span>
                    {sortIcon("nama")}
                  </button>
                </th>
                <th className={`${cellPadding}`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("umurBulan")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase"
                  >
                    <span>Umur (bln)</span>
                    {sortIcon("umurBulan")}
                  </button>
                </th>
                <th className={`${cellPadding}`}>Gender</th>
                <th className={`${cellPadding}`}>Kategori</th>
                <th className={`${cellPadding} text-right`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("tinggiCm")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase justify-end w-full"
                  >
                    <span>Tinggi</span>
                    {sortIcon("tinggiCm")}
                  </button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("beratKg")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase justify-end w-full"
                  >
                    <span>Berat</span>
                    {sortIcon("beratKg")}
                  </button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("suhuC")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase justify-end w-full"
                  >
                    <span>Suhu</span>
                    {sortIcon("suhuC")}
                  </button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("hrBpm")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase justify-end w-full"
                  >
                    <span>HR (Nadi)</span>
                    {sortIcon("hrBpm")}
                  </button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("spo2Pct")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase justify-end w-full"
                  >
                    <span>SpO₂</span>
                    {sortIcon("spo2Pct")}
                  </button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  <button
                    type="button"
                    onClick={() => toggleSort("glukosaMgdl")}
                    className="group inline-flex items-center gap-1 font-bold text-slate-700 hover:text-sky-700 uppercase justify-end w-full"
                  >
                    <span>Glukosa</span>
                    {sortIcon("glukosaMgdl")}
                  </button>
                </th>
                <th className={`${cellPadding} text-center`}>Status</th>
                <th className={`${cellPadding} text-center w-20 no-print`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRows.map((row, index) => {
                const rowIndex = pageSize === 0 ? index + 1 : (currentPage - 1) * pageSize + index + 1;
                const isFever = typeof row.suhuC === "number" && row.suhuC > 37.5;
                const isHypo = typeof row.suhuC === "number" && row.suhuC < 36.0;
                const isLowSpo2 = typeof row.spo2Pct === "number" && row.spo2Pct < 95;
                const gLabel = glucoseLabel(row.glukosaStatus);

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRecord(row)}
                    className={`cursor-pointer transition-colors hover:bg-sky-50/50 ${
                      selectedRecord?.id === row.id ? "bg-sky-50" : ""
                    }`}
                  >
                    <td className={`${cellPadding} text-center font-mono text-[11px] text-slate-400`}>
                      {rowIndex}
                    </td>

                    <td className={`${cellPadding}`}>
                      <div className="font-bold text-slate-900 capitalize">
                        {row.nama ?? "-"}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {row.sessionId ?? row.id.slice(-8)}
                      </div>
                    </td>

                    <td className={`${cellPadding} font-mono tabular-nums text-slate-700`}>
                      {formatNumber(row.umurBulan, 1)}
                    </td>

                    <td className={`${cellPadding}`}>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          row.gender?.toLowerCase().startsWith("p")
                            ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50"
                            : "bg-sky-50 text-sky-700 ring-1 ring-sky-200/50"
                        }`}
                      >
                        {row.gender ?? "-"}
                      </span>
                    </td>

                    <td className={`${cellPadding} capitalize text-slate-600`}>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                        {row.kategoriTinggi ?? "-"}
                      </span>
                    </td>

                    <td className={`${cellPadding} text-right font-mono tabular-nums text-slate-700`}>
                      {formatNumber(row.tinggiCm, 1)}{" "}
                      <span className="text-[10px] text-slate-400">cm</span>
                    </td>

                    <td className={`${cellPadding} text-right font-mono tabular-nums text-slate-700`}>
                      {formatNumber(row.beratKg, 2)}{" "}
                      <span className="text-[10px] text-slate-400">kg</span>
                    </td>

                    <td className={`${cellPadding} text-right font-mono tabular-nums`}>
                      {isFever ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                          <span>{formatNumber(row.suhuC, 1)}°C</span>
                        </span>
                      ) : isHypo ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          <span>{formatNumber(row.suhuC, 1)}°C</span>
                        </span>
                      ) : (
                        <span className="text-slate-800 font-medium">
                          {formatNumber(row.suhuC, 1)}°C
                        </span>
                      )}
                    </td>

                    <td className={`${cellPadding} text-right font-mono tabular-nums text-slate-800`}>
                      <span className="font-semibold">{formatNumber(row.hrBpm, 0)}</span>{" "}
                      <span className="text-[10px] text-slate-400">bpm</span>
                    </td>

                    <td className={`${cellPadding} text-right font-mono tabular-nums`}>
                      {isLowSpo2 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          <span>{formatNumber(row.spo2Pct, 1)}%</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700">
                          {formatNumber(row.spo2Pct, 1)}%
                        </span>
                      )}
                    </td>

                    <td className={`${cellPadding} text-right font-mono tabular-nums text-slate-900 font-semibold`}>
                      {formatNumber(row.glukosaMgdl, 1)}{" "}
                      <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                    </td>

                    <td className={`${cellPadding} text-center`}>
                      <span className={`badge ${glucoseBadgeClass(row.glukosaStatus)}`}>
                        {gLabel}
                      </span>
                    </td>

                    <td className={`${cellPadding} text-center no-print`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(row);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-sky-100 hover:text-sky-800 transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      Tidak ada data yang cocok dengan filter
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba bersihkan pencarian atau ubah kriteria filter di atas.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Database Footer & Pagination Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan <strong>{paginatedRows.length}</strong> dari{" "}
              <strong>{filtered.length}</strong> data terfilter (Total: {rows.length})
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
              <span className="text-[11px] text-slate-500">Per hal:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="input-db text-[11px] py-1 px-2"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={0}>Semua</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn-secondary px-2 py-1 text-[11px] disabled:opacity-40"
              >
                « Awal
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary px-2 py-1 text-[11px] disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <span className="px-2 font-mono text-[11px] font-semibold text-slate-700">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary px-2 py-1 text-[11px] disabled:opacity-40"
              >
                Next ›
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn-secondary px-2 py-1 text-[11px] disabled:opacity-40"
              >
                Akhir »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Medical Dossier Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-up">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-sky-100 text-sky-800 ring-1 ring-sky-200">
                    Rekam Medis Balita
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Session: {selectedRecord.sessionId ?? "-"}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 capitalize">
                  {selectedRecord.nama ?? "Balita Tanpa Nama"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
              {/* Identitas Section */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  Identitas Pasien Balita
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tanggal Lahir</span>
                    <span className="font-semibold text-slate-800">{selectedRecord.tanggalLahir ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Usia Pengukuran</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatNumber(selectedRecord.umurBulan, 1)} bulan
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-800">{selectedRecord.gender ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kategori Pertumbuhan</span>
                    <span className="font-semibold text-slate-800 capitalize">{selectedRecord.kategoriTinggi ?? "-"}</span>
                  </div>
                </div>
              </div>

              {/* Tanda Vital Section with Vector SVG Icons */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  Pengukuran Tanda-Tanda Vital
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-700">Suhu Tubuh</span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {formatNumber(selectedRecord.suhuC, 1)}°C
                    </p>
                    <span className="text-[10px] text-slate-400">Normal: 36.5 - 37.5°C</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-700">Detak Jantung (HR)</span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {formatNumber(selectedRecord.hrBpm, 0)} <span className="text-xs font-normal">bpm</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Rentang Balita: 80 - 130 bpm</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-700">Saturasi Oksigen (SpO₂)</span>
                    </div>
                    <p className="text-xl font-extrabold text-emerald-700 mt-1 tabular-nums">
                      {formatNumber(selectedRecord.spo2Pct, 1)}%
                    </p>
                    <span className="text-[10px] text-slate-400">Target Normal: ≥ 95%</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-700">Glukosa Darah</span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {formatNumber(selectedRecord.glukosaMgdl, 1)} <span className="text-xs font-normal">mg/dL</span>
                    </p>
                    <span className={`badge mt-1 ${glucoseBadgeClass(selectedRecord.glukosaStatus)}`}>
                      Status: {glucoseLabel(selectedRecord.glukosaStatus)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-3.5 w-3.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-700">Panjang/Tinggi Badan</span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {formatNumber(selectedRecord.tinggiCm, 1)} <span className="text-xs font-normal">cm</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Antropometri</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-700">Berat Badan</span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {formatNumber(selectedRecord.beratKg, 2)} <span className="text-xs font-normal">kg</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Antropometri</span>
                  </div>
                </div>
              </div>

              {/* Status & Diagnostik Sensor Hardware PPG */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  Validasi Sensor & Diagnostik Sinyal PPG
                </h4>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">fs Red IR:</span>
                      <span className="font-semibold text-slate-800">{formatNumber(selectedRecord.fsRedirHz, 2)} Hz</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">fs Green:</span>
                      <span className="font-semibold text-slate-800">{formatNumber(selectedRecord.fsGreenHz, 2)} Hz</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">fs Resample:</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.fsResampleHz ?? "-"} Hz</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">N Sampel PPG:</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.nSamplePpg ?? "-"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-500">Validasi Kualitas:</span>
                    <span
                      className={`badge ${
                        selectedRecord.fsKualitasOk
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {selectedRecord.fsKualitasOk ? "Frekuensi OK" : "Frekuensi Kurang"}
                    </span>
                    <span
                      className={`badge ${
                        selectedRecord.durasiKualitasOk
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {selectedRecord.durasiKualitasOk ? "Durasi Sinyal OK" : "Durasi Kurang"}
                    </span>
                  </div>

                  {selectedRecord.glukosaStatus && (
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80 mt-1">
                      <span className="font-semibold text-slate-700">Rincian Komputasi: </span>
                      {selectedRecord.glukosaStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
                  alert("Data JSON rekam medis berhasil disalin ke clipboard!");
                }}
                className="btn-secondary text-xs"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Salin JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="btn-primary text-xs"
              >
                Tutup Rekam Medis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
