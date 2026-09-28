"""Contoh upload CSV timbangan bayi lewat command line.

Penggunaan:
    python example_upload.py --file hasil_timbangan_bayi.csv
    python example_upload.py --file hasil_timbangan_bayi.csv --title "Data Timbangan Bayi 16 September 2026"
    python example_upload.py --latest --folder ./data
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from uploader import DEVICE_TYPE, UploadError, Uploader, latest_csv


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Upload CSV timbangan bayi ke server Posyandu"
    )
    parser.add_argument("--file", help="Path file CSV yang akan diunggah")
    parser.add_argument("--title", help="Judul kartu (opsional)")
    parser.add_argument(
        "--device-type",
        default=DEVICE_TYPE,
        help=f"Jenis alat yang dikirim (default: {DEVICE_TYPE})",
    )
    parser.add_argument(
        "--latest",
        action="store_true",
        help="Unggah file CSV terbaru dari --folder",
    )
    parser.add_argument(
        "--folder",
        default=".",
        help="Folder untuk mencari CSV terbaru (dipakai dengan --latest)",
    )
    parser.add_argument(
        "--config",
        default="config.ini",
        help="Path file konfigurasi (default: config.ini)",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    if args.latest:
        target = latest_csv(args.folder)
        if target is None:
            print(f"Tidak ada file CSV di folder '{args.folder}'")
            return 1
    elif args.file:
        target = Path(args.file)
    else:
        parser.error("Tentukan --file atau --latest")
        return 2

    try:
        uploader = Uploader.from_config(args.config)
        result = uploader.upload_csv(
            target,
            title=args.title,
            device_type=args.device_type,
        )
    except UploadError as error:
        print(f"Gagal upload: {error}")
        return 1

    print(
        f"Sukses! {result.get('recordCount')} data terkirim "
        f"sebagai '{result.get('title')}' (batchId: {result.get('batchId')})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
