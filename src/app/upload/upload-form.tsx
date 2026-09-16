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
          className="mb-1.5 block text-sm font-medium text-blue-900"
        >
          Judul Kartu <span className="text-slate-400">(opsional)</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="input-cloud"
          placeholder="Contoh: Data Vital Sign 16 September 2026"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Jika dikosongkan, judul dibuat otomatis dari tanggal unggah.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-blue-900">
          File CSV
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-sky-50"
        >
          <span className="text-3xl">☁️⬆️</span>
          {file ? (
            <>
              <span className="text-sm font-semibold text-blue-800">
                {file.name}
              </span>
              <span className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB • klik untuk mengganti
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-blue-800">
                Klik untuk memilih file
              </span>
              <span className="text-xs text-slate-500">
                Format .csv hasil pengukuran Vital Sign
              </span>
            </>
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
        <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 ring-1 ring-rose-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="btn-primary w-full"
      >
        {isUploading ? "Mengunggah..." : "Upload & Simpan"}
      </button>
    </form>
  );
}
