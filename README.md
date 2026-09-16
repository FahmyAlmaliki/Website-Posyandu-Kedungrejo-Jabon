# Website Posyandu Kedungrejo Jabon

Website untuk menampilkan data hasil pengukuran **Vital Sign** Posyandu
Kedungrejo Jabon. Setiap file CSV yang diunggah menjadi satu **kartu** di
halaman utama; klik kartu untuk melihat tabel data dan mencari nama balita.

Dibangun dengan **Next.js 15**, **Prisma + SQLite**, **Tailwind CSS**, dan
dijalankan sepenuhnya dengan **Docker**.

## Fitur

- Halaman utama berisi kartu per upload (judul, tanggal, sumber, jumlah data).
- Halaman detail: tabel data, pencarian nama, filter gender/kategori, urut data,
  dan export CSV.
- Upload CSV manual oleh admin melalui halaman web.
- API untuk alat Vital Sign mengirim CSV otomatis (header `X-API-Key`).
- Login admin untuk proteksi halaman upload.
- Tema biru muda / putih / biru tua (nuansa langit dan awan).

## Menjalankan dengan Docker

Semua kebutuhan (Node.js, dependensi, Prisma) sudah terpasang di dalam image.

1. Siapkan konfigurasi:

   ```bash
   cp .env.example .env
   ```

   Sesuaikan minimal:

   ```env
   DATABASE_URL="file:../data/app.db"
   DEVICE_API_KEY="api-key-rahasia-untuk-alat"
   AUTH_SECRET="string-acak-minimal-32-karakter"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="password-admin"
   ```

2. Build dan jalankan:

   ```bash
   docker compose up -d --build
   ```

3. Buka `http://localhost:3000`.

Data (database SQLite + file CSV asli) disimpan pada volume Docker
`posyandu-data` di `/app/data`, sehingga tidak hilang saat container dibuat
ulang.

Perintah berguna:

```bash
docker compose logs -f web     # lihat log
docker compose down            # hentikan
docker compose up -d --build   # build ulang
```

> **Catatan:** menghapus volume (`docker compose down -v`) akan menghapus seluruh
> database dan file CSV yang sudah diunggah.

## Login & Upload Web

- Buka `/login`, masuk dengan `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.
- Setelah masuk, buka `/upload` untuk mengunggah CSV dan mengisi judul kartu.
- Jika judul dikosongkan, otomatis dibuat: `Data Vital Sign <tanggal>`.

## API untuk Alat Vital Sign

Alat mengirim file CSV dengan satu request `multipart/form-data`:

```bash
curl -X POST "http://SERVER:3000/api/v1/measurements/upload" \
  -H "X-API-Key: API_KEY_ANDA" \
  -F "file=@hasil_pengukuran.csv" \
  -F "title=Data Vital Sign 16 September 2026"
```

Program contoh Python untuk alat ada di [`examples/device`](examples/device),
dan dokumentasi lengkap ada di [`docs/API.md`](docs/API.md).

## Struktur Proyek

```
prisma/schema.prisma        Skema database (Batch, Measurement, AdminUser)
prisma/seed.ts              Seed admin + import CSV contoh
src/app/                    Halaman & API routes Next.js
src/components/             Komponen UI (kartu, tabel, navbar)
src/lib/                    Prisma, parser CSV, API key, auth, storage
docs/API.md                 Dokumentasi API
examples/device/            Program contoh Python untuk alat
docker/entrypoint.sh        Migrasi + seed otomatis saat container start
Dockerfile / docker-compose.yml
hasil_pengukuran.csv        Contoh data (diimpor otomatis saat pertama jalan)
```

## Pengembangan Lokal (opsional)

Tanpa Docker (butuh Node.js 22 di komputer):

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Perintah lain:

```bash
npm run build      # build produksi
npm run lint       # eslint
npm run typecheck  # cek tipe TypeScript
```
