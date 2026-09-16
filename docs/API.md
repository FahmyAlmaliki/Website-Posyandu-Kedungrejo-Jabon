# API Upload Data Vital Sign

Dokumen ini menjelaskan cara alat Vital Sign (Python) mengirim hasil pengukuran
ke website Posyandu Kedungrejo Jabon.

## Ringkasan

| Item | Nilai |
| --- | --- |
| Method | `POST` |
| Path | `/api/v1/measurements/upload` |
| Autentikasi | Header `X-API-Key` |
| Content-Type | `multipart/form-data` |
| Field | `file` (wajib, file CSV), `title` (opsional, judul kartu) |
| Ukuran maksimal | 10 MB |

Setiap upload akan membuat **satu kartu** di halaman utama. Kartu berisi seluruh
baris data dari file CSV tersebut.

## Format CSV

Baris pertama harus berupa header. Kolom yang dikenali (nama kolom boleh
bervariasi dengan pemisah `_`):

```
session_id,nama,tanggal_lahir,umur_bulan,gender,kategori_tinggi,tinggi_cm,berat_kg,suhu_c,hr_bpm,spo2_pct,fs_redir_hz_terukur,fs_green_hz_terukur,fs_resample_hz,fs_kualitas_ok,durasi_kualitas_ok,n_sample_ppg,glukosa_mgdl,glukosa_status
```

- Kolom yang tidak dikenal akan diabaikan.
- Kolom yang kosong akan disimpan sebagai kosong (`null`).
- Nilai boolean menerima `TRUE/FALSE`, `1/0`, `ya/tidak`.
- Tanggal lahir menerima format `dd-mm-yyyy`, `d/m/yyyy`, atau `dd.mm.yyyy`.

## Contoh dengan cURL

```bash
curl -X POST "http://SERVER:3000/api/v1/measurements/upload" \
  -H "X-API-Key: API_KEY_ANDA" \
  -F "file=@hasil_pengukuran.csv" \
  -F "title=Data Vital Sign 16 September 2026"
```

## Respons

Berhasil (HTTP 201):

```json
{
  "status": "ok",
  "message": "Data berhasil diunggah.",
  "batchId": "cmu45gqh00000o25jj1g3xgsl",
  "title": "Data Vital Sign 16 September 2026",
  "recordCount": 13
}
```

Gagal:

| HTTP | Arti |
| --- | --- |
| `400` | Body/file tidak valid, atau CSV tanpa data |
| `401` | `X-API-Key` salah atau tidak dikirim |
| `413` | Ukuran file melebihi 10 MB |

Contoh:

```json
{ "status": "error", "message": "API key tidak valid atau tidak dikirim." }
```

## Integrasi ke Program Python Alat

Contoh lengkap tersedia di folder [`examples/device`](../examples/device):

- `uploader.py` — modul `Uploader.upload_csv()` siap impor.
- `example_upload.py` — contoh pemakaian dari command line.
- `gui_button_example.py` — contoh tombol Upload (tkinter).
- `config.ini.example` — template konfigurasi.

### Langkah singkat

1. Salin folder `examples/device` ke alat, lalu salin
   `config.ini.example` menjadi `config.ini` dan isi `server_url` + `api_key`.
2. Pasang dependensi:

   ```bash
   pip install -r requirements.txt
   ```

3. Panggil dari program yang sudah ada saat tombol Upload ditekan:

   ```python
   from uploader import Uploader, UploadError

   def kirim_hasil(csv_path):
       try:
           uploader = Uploader.from_config("config.ini")
           hasil = uploader.upload_csv(
               csv_path,
               title="Data Vital Sign 16 September 2026",
           )
           print("Terkirim:", hasil["recordCount"], "data")
           return True
       except UploadError as error:
           print("Upload gagal:", error)
           return False
   ```

`upload_csv()` sudah menangani timeout, percobaan ulang, dan pesan error dari
server, sehingga cukup menangkap `UploadError` untuk menampilkan notifikasi ke
petugas.

## Keamanan

- Simpan `api_key` hanya di `config.ini` alat, jangan dibagikan.
- `DEVICE_API_KEY` di server dapat diganti kapan saja pada file `.env` lalu
  restart container.
