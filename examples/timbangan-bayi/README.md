# Program Contoh untuk Alat Timbangan Bayi

Folder ini berisi contoh program Python untuk mengirim hasil pengukuran
**Timbangan Bayi** (berat, panjang badan, status gizi WHO) ke website Posyandu
melalui API. Data otomatis diberi label **Timbangan Bayi** di dashboard.

## Berkas

| Berkas | Keterangan |
| --- | --- |
| `uploader.py` | Modul utama, kelas `Uploader` dengan method `upload_csv()` |
| `example_upload.py` | Contoh pemakaian dari command line |
| `gui_button_example.py` | Contoh tombol Upload dengan tampilan tkinter |
| `config.ini.example` | Template konfigurasi, salin menjadi `config.ini` |
| `requirements.txt` | Dependensi Python |
| `hasil_timbangan_bayi.csv` | Contoh berkas hasil pengukuran |

## Format CSV

Baris pertama harus berupa header:

```
session_id,nama,tanggal_lahir,jenis_kelamin,usia_bulan,berat_kg,panjang_cm,standar,status_pb_u,status_bb_u,status_bb_pb,status_keseluruhan
```

Contoh baris data:

```csv
20260912_040533,Abrisam,06-07-2026,Laki-laki,2.2,5.615,62.5,WHO Child Growth Standards (baring),z = 1.7 — Normal,z = -0.2 — Berat badan normal,z = -2.1 — Kurus (wasted),waspada
```

## Cara Pakai

```bash
pip install -r requirements.txt
cp config.ini.example config.ini
# edit config.ini: isi server_url dan api_key
python example_upload.py --file hasil_timbangan_bayi.csv --title "Data Timbangan Bayi 16 September 2026"
```

Atau unggah CSV terbaru di sebuah folder:

```bash
python example_upload.py --latest --folder ./data
```

## Integrasi ke Program yang Sudah Ada

Cukup impor dan panggil saat tombol Upload ditekan:

```python
from uploader import Uploader, UploadError

uploader = Uploader.from_config("config.ini")

try:
    hasil = uploader.upload_csv(
        "hasil_timbangan_bayi.csv",
        title="Data Timbangan Bayi 16 September 2026",
    )
    print("Berhasil:", hasil["recordCount"], "data")
except UploadError as e:
    print("Gagal:", e)
```

`upload_csv()` otomatis mengirim `device_type=baby_scale`, jadi dashboard akan
menampilkan kartu dengan label Timbangan Bayi.

Dokumentasi API lengkap ada di [`../../docs/API.md`](../../docs/API.md).
