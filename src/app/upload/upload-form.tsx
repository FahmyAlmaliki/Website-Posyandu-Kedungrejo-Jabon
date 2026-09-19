"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface UploadResult {
  batchId: string;
  title: string;
  recordCount: number;
}

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Pilih file CSV terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Upload gagal.");
      }

      const result = payload as UploadResult;
      router.push(`/batch/${result.batchId}`);
      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload gagal.",
      );
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-xs font-semibold text-slate-800 uppercase tracking-wider"
        >
          Nama Sesi / Judul Registri <span className="text-slate-400 font-normal">(opsional)</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="input-db w-full text-sm"
          placeholder="Contoh: Pengukuran Balita Posyandu Melati 16 September 2026"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Jika tidak diisi, judul akan dibuat otomatis berdasarkan tanggal dan waktu pengunggahan.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Berkas CSV Data Pengukuran
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition hover:border-sky-400 hover:bg-sky-50/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200 group-hover:border-sky-300 transition">
            <svg
              className="h-6 w-6 text-slate-500 group-hover:text-sky-600 transition"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {file ? (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block">
                {file.name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti berkas
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-800 block group-hover:text-sky-700 transition">
                Pilih atau seret berkas CSV ke sini
              </span>
              <span className="text-[11px] text-slate-400 block">
                Mendukung file hasil ekspor alat ukur vital sign (berisi kolom nama, session_id, spo2, suhu, dsb.)
              </span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 ring-1 ring-rose-200">
          <svg className="h-4 w-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="btn-primary w-full py-2.5 text-xs uppercase tracking-wider font-bold"
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Memproses dan Menyimpan ke Database...</span>
          </span>
        ) : (
          "Simpan ke Basis Data Registri"
        )}
      </button>
    </form>
  );
}
