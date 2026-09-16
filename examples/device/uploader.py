"""Modul upload CSV hasil pengukuran ke server Posyandu.

Modul ini dirancang untuk diimpor oleh program Python yang sudah ada di alat
Vital Sign. Cukup panggil ``Uploader.upload_csv()`` saat tombol Upload ditekan.

Contoh:
    from uploader import Uploader

    uploader = Uploader.from_config()
    hasil = uploader.upload_csv("hasil_pengukuran.csv", title="Data Vital Sign 16 September 2026")
    print(hasil["recordCount"], "data terkirim")
"""

from __future__ import annotations

import configparser
import logging
import time
from pathlib import Path
from typing import Any, Optional

import requests

logger = logging.getLogger(__name__)

DEFAULT_CONFIG_PATH = Path(__file__).with_name("config.ini")
UPLOAD_PATH = "/api/v1/measurements/upload"


class UploadError(Exception):
    """Dilempar ketika upload ke server gagal."""


class Uploader:
    """Klien sederhana untuk mengirim CSV ke API Posyandu."""

    def __init__(
        self,
        server_url: str,
        api_key: str,
        timeout: int = 30,
        verify_ssl: bool = True,
        retries: int = 3,
    ) -> None:
        self.server_url = server_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.retries = max(1, retries)
        self.session = requests.Session()

    @classmethod
    def from_config(cls, path: Path | str = DEFAULT_CONFIG_PATH) -> "Uploader":
        """Membuat Uploader dari file config.ini."""
        config_path = Path(path)
        if not config_path.is_file():
            raise UploadError(f"File konfigurasi tidak ditemukan: {config_path}")

        parser = configparser.ConfigParser()
        parser.read(config_path)

        if not parser.has_section("server"):
            raise UploadError("config.ini harus memiliki bagian [server]")

        section = parser["server"]
        return cls(
            server_url=section.get("server_url", "").strip(),
            api_key=section.get("api_key", "").strip(),
            timeout=section.getint("timeout", fallback=30),
            verify_ssl=section.getboolean("verify_ssl", fallback=True),
            retries=section.getint("retries", fallback=3),
        )

    def upload_csv(
        self,
        csv_path: Path | str,
        title: Optional[str] = None,
    ) -> dict[str, Any]:
        """Kirim satu file CSV ke server.

        Args:
            csv_path: lokasi file CSV hasil pengukuran.
            title: judul kartu (opsional). Bila kosong, server membuat otomatis.

        Returns:
            dict respons server, mis. ``{"status": "ok", "batchId": ..., "recordCount": 13}``.

        Raises:
            UploadError: bila file tidak ada atau upload gagal.
        """
        path = Path(csv_path)
        if not path.is_file():
            raise UploadError(f"File tidak ditemukan: {path}")
        if not self.server_url:
            raise UploadError("server_url belum diisi pada config.ini")
        if not self.api_key:
            raise UploadError("api_key belum diisi pada config.ini")

        endpoint = f"{self.server_url}{UPLOAD_PATH}"
        headers = {"X-API-Key": self.api_key}
        data = {"title": title} if title else {}

        last_error: Optional[UploadError] = None

        for attempt in range(1, self.retries + 1):
            try:
                with open(path, "rb") as handle:
                    files = {"file": (path.name, handle, "text/csv")}
                    response = self.session.post(
                        endpoint,
                        headers=headers,
                        files=files,
                        data=data,
                        timeout=self.timeout,
                        verify=self.verify_ssl,
                    )
            except requests.RequestException as exc:
                last_error = UploadError(f"Gagal terhubung ke server: {exc}")
                logger.warning("Percobaan %s gagal: %s", attempt, exc)
            else:
                if response.status_code in (200, 201):
                    payload = response.json()
                    logger.info(
                        "Upload sukses: %s data, judul '%s'",
                        payload.get("recordCount"),
                        payload.get("title"),
                    )
                    return payload

                message = self._extract_message(response)

                # Kesalahan dari sisi klien (4xx) tidak perlu diulang.
                if 400 <= response.status_code < 500:
                    raise UploadError(
                        f"Server menolak upload ({response.status_code}): {message}"
                    )

                last_error = UploadError(
                    f"Server error ({response.status_code}): {message}"
                )
                logger.warning("Percobaan %s gagal: %s", attempt, last_error)

            if attempt < self.retries:
                time.sleep(2 * attempt)

        raise last_error or UploadError("Upload gagal tanpa keterangan")

    @staticmethod
    def _extract_message(response: requests.Response) -> str:
        try:
            payload = response.json()
            if isinstance(payload, dict) and payload.get("message"):
                return str(payload["message"])
        except ValueError:
            pass
        return response.text[:200]


def latest_csv(folder: Path | str) -> Optional[Path]:
    """Mengembalikan file CSV terbaru di dalam folder (berguna untuk tombol upload)."""
    directory = Path(folder)
    if not directory.is_dir():
        return None
    candidates = list(directory.glob("*.csv"))
    if not candidates:
        return None
    return max(candidates, key=lambda item: item.stat().st_mtime)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )
    try:
        client = Uploader.from_config()
        result = client.upload_csv("hasil_pengukuran.csv")
        print("Berhasil:", result)
    except UploadError as error:
        print("Gagal:", error)
