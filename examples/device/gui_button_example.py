"""Contoh tombol Upload (tkinter) untuk diadaptasi ke UI alat Vital Sign.

Alur:
    1. Program pengukuran menyimpan hasil ke satu file CSV.
    2. Petugas menekan tombol "Upload ke Website".
    3. Program mencari CSV terbaru di folder data lalu mengirimnya ke API.

Sesuaikan DATA_FOLDER dan config.ini dengan kondisi alat.
"""

from __future__ import annotations

import logging
import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from uploader import UploadError, Uploader, latest_csv

DATA_FOLDER = Path(__file__).parent / "data"


class UploadApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Vital Sign - Upload Data")
        self.root.geometry("420x260")
        self.root.configure(bg="#eef7ff")

        try:
            self.uploader = Uploader.from_config()
            self.server_label = self.uploader.server_url
        except UploadError as error:
            self.uploader = None
            self.server_label = f"Konfigurasi error: {error}"

        self.selected_file: Path | None = None

        title = tk.Label(
            root,
            text="Posyandu Kedungrejo Jabon",
            font=("Segoe UI", 14, "bold"),
            bg="#eef7ff",
            fg="#1e3a8a",
        )
        title.pack(pady=(18, 2))

        self.status = tk.Label(
            root,
            text=self.server_label,
            font=("Segoe UI", 9),
            bg="#eef7ff",
            fg="#64748b",
        )
        self.status.pack(pady=(0, 14))

        self.progress = ttk.Progressbar(root, mode="indeterminate", length=320)
        self.progress.pack(pady=(0, 12))

        self.upload_button = tk.Button(
            root,
            text="☁  Upload ke Website",
            font=("Segoe UI", 12, "bold"),
            bg="#1d4ed8",
            fg="white",
            activebackground="#1e40af",
            activeforeground="white",
            relief="flat",
            padx=18,
            pady=12,
            command=self.on_upload_clicked,
        )
        self.upload_button.pack(pady=6)

        self.pick_button = tk.Button(
            root,
            text="Pilih file lain...",
            font=("Segoe UI", 9),
            bg="#e0f2fe",
            fg="#1e3a8a",
            relief="flat",
            command=self.pick_file,
        )
        self.pick_button.pack(pady=(8, 0))

    def pick_file(self) -> None:
        chosen = filedialog.askopenfilename(
            title="Pilih file CSV",
            filetypes=[("CSV files", "*.csv")],
        )
        if chosen:
            self.selected_file = Path(chosen)
            self.status.config(text=f"Dipilih: {self.selected_file.name}")

    def on_upload_clicked(self) -> None:
        if self.uploader is None:
            messagebox.showerror("Error", self.server_label)
            return

        target = self.selected_file or latest_csv(DATA_FOLDER)
        if target is None:
            messagebox.showwarning(
                "Tidak ada file",
                "Tidak ditemukan file CSV. Ukur terlebih dahulu atau pilih file manual.",
            )
            return

        self.upload_button.config(state="disabled", text="Mengirim...")
        self.progress.start(12)
        self.status.config(text=f"Mengirim {target.name} ...")

        threading.Thread(
            target=self._do_upload,
            args=(target,),
            daemon=True,
        ).start()

    def _do_upload(self, target: Path) -> None:
        try:
            result = self.uploader.upload_csv(target)
        except UploadError as error:
            self.root.after(0, self._on_failed, str(error))
        else:
            self.root.after(0, self._on_success, result)

    def _on_success(self, result: dict) -> None:
        self.progress.stop()
        self.upload_button.config(state="normal", text="☁  Upload ke Website")
        self.status.config(
            text=f"Terkirim: {result.get('recordCount')} data"
        )
        messagebox.showinfo(
            "Berhasil",
            f"{result.get('recordCount')} data berhasil diunggah.\n"
            f"Judul: {result.get('title')}",
        )

    def _on_failed(self, message: str) -> None:
        self.progress.stop()
        self.upload_button.config(state="normal", text="☁  Upload ke Website")
        self.status.config(text="Upload gagal")
        messagebox.showerror("Gagal", message)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    root = tk.Tk()
    UploadApp(root)
    root.mainloop()
