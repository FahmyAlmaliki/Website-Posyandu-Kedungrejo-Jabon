"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBatch } from "@/app/actions/batch";

interface DeleteBatchButtonProps {
  batchId: string;
  batchTitle: string;
  redirectTo?: string;
  variant?: "icon" | "solid";
}

export function DeleteBatchButton({
  batchId,
  batchTitle,
  redirectTo,
  variant = "icon",
}: DeleteBatchButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Hapus batch "${batchTitle}"?\n\nSeluruh data rekaman dan berkas CSV pada batch ini akan dihapus secara permanen dari database.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteBatch(batchId);
      if (result.status === "error") {
        window.alert(result.message);
        setIsDeleting(false);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      window.alert("Gagal menghapus data. Silakan coba lagi.");
      setIsDeleting(false);
    }
  }

  if (variant === "solid") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="btn-danger"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>{isDeleting ? "Menghapus..." : "Hapus Batch"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Hapus batch data"
      aria-label={`Hapus batch ${batchTitle}`}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-400 shadow-xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDeleting ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-rose-600 border-t-transparent" />
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}
