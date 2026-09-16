"use client";

import { Fragment, useMemo, useState } from "react";
import { formatNumber } from "@/lib/format";

export interface MeasurementRow {
  id: string;
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
}

type SortKey = "nama" | "umurBulan" | "tinggiCm" | "beratKg" | "glukosaMgdl";

function glucoseLabel(status: string | null): string {
  if (!status) return "-";
  const lower = status.toLowerCase();
  if (lower.startsWith("ok")) return "OK";
  if (lower.includes("tinggi") || lower.includes("high")) return "Tinggi";
  if (lower.includes("rendah") || lower.includes("low")) return "Rendah";
  return status.split(":")[0].trim().slice(0, 14) || "-";
}

function glucoseBadgeClass(status: string | null): string {
  const label = glucoseLabel(status);
  if (label === "OK") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  if (label === "Tinggi") return "bg-rose-50 text-rose-600 ring-1 ring-rose-100";
  if (label === "Rendah") return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-slate-100 text-slate-500";
}

function toCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function MeasurementTable({ rows }: { rows: MeasurementRow[] }) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [kategori, setKategori] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("nama");
  const [sortAsc, setSortAsc] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = rows.filter((row) => {
      if (q && !(row.nama ?? "").toLowerCase().includes(q)) return false;
      if (gender !== "all" && row.gender !== gender) return false;
      if (kategori !== "all" && row.kategoriTinggi !== kategori) return false;
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
  }, [rows, query, gender, kategori, sortKey, sortAsc]);

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
    link.download = `data-vital-sign-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? "▲" : "▼") : "";

  return (
    <div className="space-y-4">
      <div className="card-cloud flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama anak..."
              className="input-cloud pl-10"
            />
          </div>

          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="input-cloud sm:w-44"
          >
            <option value="all">Semua Gender</option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={kategori}
            onChange={(event) => setKategori(event.target.value)}
            className="input-cloud sm:w-40"
          >
            <option value="all">Semua Kategori</option>
            {kategoriOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={exportCsv} className="btn-secondary">
          ⬇ Export CSV
        </button>
      </div>

      <div className="card-cloud overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-sky-50/80 text-left text-xs uppercase tracking-wide text-blue-800">
                <th className="px-4 py-3 font-semibold">No</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("nama")}
                    className="font-semibold uppercase tracking-wide"
                  >
                    Nama {sortIndicator("nama")}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("umurBulan")}
                    className="font-semibold uppercase tracking-wide"
                  >
                    Umur (bln) {sortIndicator("umurBulan")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("tinggiCm")}
                    className="font-semibold uppercase tracking-wide"
                  >
                    Tinggi {sortIndicator("tinggiCm")}
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("beratKg")}
                    className="font-semibold uppercase tracking-wide"
                  >
                    Berat {sortIndicator("beratKg")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Suhu</th>
                <th className="px-4 py-3 font-semibold">HR</th>
                <th className="px-4 py-3 font-semibold">SpO₂</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("glukosaMgdl")}
                    className="font-semibold uppercase tracking-wide"
                  >
                    Glukosa {sortIndicator("glukosaMgdl")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <Fragment key={row.id}>
                  <tr
                    onClick={() =>
                      setExpanded(expanded === row.id ? null : row.id)
                    }
                    className="cursor-pointer border-t border-sky-50 transition hover:bg-sky-50/50"
                  >
                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-blue-900">
                      {row.nama ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(row.umurBulan, 1)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.gender ?? "-"}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">
                      {row.kategoriTinggi ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(row.tinggiCm, 1)} cm
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(row.beratKg, 2)} kg
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(row.suhuC, 1)}°C
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(row.hrBpm, 0)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(row.spo2Pct, 1)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {formatNumber(row.glukosaMgdl, 1)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${glucoseBadgeClass(row.glukosaStatus)}`}>
                        {glucoseLabel(row.glukosaStatus)}
                      </span>
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr className="border-t border-sky-50 bg-sky-50/40">
                      <td colSpan={12} className="px-4 py-3">
                        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                          <div>
                            <p className="font-semibold text-blue-900">
                              Session ID
                            </p>
                            <p className="text-slate-600">
                              {row.sessionId ?? "-"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900">
                              Tanggal Lahir
                            </p>
                            <p className="text-slate-600">
                              {row.tanggalLahir ?? "-"}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="font-semibold text-blue-900">
                              Status Glukosa
                            </p>
                            <p className="text-slate-600">
                              {row.glukosaStatus ?? "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Tidak ada data yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-sky-50 bg-white/70 px-4 py-3 text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filtered.length}</strong> dari {rows.length}{" "}
            data
          </span>
          <span className="hidden sm:inline">
            Klik baris untuk melihat detail
          </span>
        </div>
      </div>
    </div>
  );
}
