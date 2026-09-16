# Program Contoh untuk Alat Vital Sign

Folder ini berisi contoh program Python untuk mengirim file CSV hasil
pengukuran ke website Posyandu melalui API.

## Berkas

| Berkas | Keterangan |
| --- | --- |
| `uploader.py` | Modul utama, kelas `Uploader` dengan method `upload_csv()` |
| `example_upload.py` | Contoh pemakaian dari command line |
| `gui_button_example.py` | Contoh tombol Upload dengan tampilan tkinter |
| `config.ini.example` | Template konfigurasi, salin menjadi `config.ini` |
| `requirements.txt` | Dependensi Python |

## Cara Pakai

```bash
pip install -r requirements.txt
cp config.ini.example config.ini
# edit config.ini: isi server_url dan api_key
python example_upload.py --file hasil_pengukuran.csv --title "Data Vital Sign 16 September 2026"
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
    hasil = uploader.upload_csv("hasil_pengukuran.csv")
    print("Berhasil:", hasil["recordCount"], "data")
except UploadError as e:
    print("Gagal:", e)
```

Dokumentasi API lengkap ada di [`../../docs/API.md`](../../docs/API.md).
