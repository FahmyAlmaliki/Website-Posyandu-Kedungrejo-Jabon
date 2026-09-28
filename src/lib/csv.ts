import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedMeasurement {
  sessionId: string | null;
  nama: string | null;
  tanggalLahir: string | null;
  umurBulan: number | null;
  gender: string | null;
  kategoriTinggi: string | null;
  tinggiCm: number | null;
  beratKg: number | null;
  suhuC: number | null;
  hrBpm: number | null;
  spo2Pct: number | null;
  fsRedirHz: number | null;
  fsGreenHz: number | null;
  fsResampleHz: number | null;
  fsKualitasOk: boolean | null;
  durasiKualitasOk: boolean | null;
  nSamplePpg: number | null;
  glukosaMgdl: number | null;
  glukosaStatus: string | null;
}

export interface ParsedBabyMeasurement {
  sessionId: string | null;
  nama: string | null;
  tanggalLahir: string | null;
  gender: string | null;
  usiaBulan: number | null;
  beratKg: number | null;
  panjangCm: number | null;
  standar: string | null;
  statusPbU: string | null;
  statusBbU: string | null;
  statusBbPb: string | null;
  statusKeseluruhan: string | null;
}

type FieldKind = "string" | "number" | "int" | "boolean" | "date";

interface FieldRule {
  key: keyof ParsedMeasurement;
  kind: FieldKind;
}

interface BabyFieldRule {
  key: keyof ParsedBabyMeasurement;
  kind: FieldKind;
}

const FIELD_RULES: Record<string, FieldRule> = {
  session_id: { key: "sessionId", kind: "string" },
  session: { key: "sessionId", kind: "string" },
  id_sesi: { key: "sessionId", kind: "string" },
  nama: { key: "nama", kind: "string" },
  tanggal_lahir: { key: "tanggalLahir", kind: "date" },
  tgl_lahir: { key: "tanggalLahir", kind: "date" },
  umur_bulan: { key: "umurBulan", kind: "number" },
  umur: { key: "umurBulan", kind: "number" },
  gender: { key: "gender", kind: "string" },
  jenis_kelamin: { key: "gender", kind: "string" },
  jk: { key: "gender", kind: "string" },
  kategori_tinggi: { key: "kategoriTinggi", kind: "string" },
  tinggi_cm: { key: "tinggiCm", kind: "number" },
  tinggi: { key: "tinggiCm", kind: "number" },
  berat_kg: { key: "beratKg", kind: "number" },
  berat: { key: "beratKg", kind: "number" },
  suhu_c: { key: "suhuC", kind: "number" },
  suhu: { key: "suhuC", kind: "number" },
  temperatur: { key: "suhuC", kind: "number" },
  hr_bpm: { key: "hrBpm", kind: "int" },
  hr: { key: "hrBpm", kind: "int" },
  heart_rate: { key: "hrBpm", kind: "int" },
  spo2_pct: { key: "spo2Pct", kind: "number" },
  spo2: { key: "spo2Pct", kind: "number" },
  fs_redir_hz_terukur: { key: "fsRedirHz", kind: "number" },
  fs_redir_hz: { key: "fsRedirHz", kind: "number" },
  fs_green_hz_terukur: { key: "fsGreenHz", kind: "number" },
  fs_green_hz: { key: "fsGreenHz", kind: "number" },
  fs_resample_hz: { key: "fsResampleHz", kind: "int" },
  fs_kualitas_ok: { key: "fsKualitasOk", kind: "boolean" },
  durasi_kualitas_ok: { key: "durasiKualitasOk", kind: "boolean" },
  n_sample_ppg: { key: "nSamplePpg", kind: "int" },
  glukosa_mgdl: { key: "glukosaMgdl", kind: "number" },
  glukosa: { key: "glukosaMgdl", kind: "number" },
  glukosa_status: { key: "glukosaStatus", kind: "string" },
};

const BABY_FIELD_RULES: Record<string, BabyFieldRule> = {
  session_id: { key: "sessionId", kind: "string" },
  session: { key: "sessionId", kind: "string" },
  id_sesi: { key: "sessionId", kind: "string" },
  nama: { key: "nama", kind: "string" },
  nama_bayi: { key: "nama", kind: "string" },
  tanggal_lahir: { key: "tanggalLahir", kind: "date" },
  tgl_lahir: { key: "tanggalLahir", kind: "date" },
  jenis_kelamin: { key: "gender", kind: "string" },
  gender: { key: "gender", kind: "string" },
  jk: { key: "gender", kind: "string" },
  usia_bulan: { key: "usiaBulan", kind: "number" },
  umur_bulan: { key: "usiaBulan", kind: "number" },
  umur: { key: "usiaBulan", kind: "number" },
  berat_kg: { key: "beratKg", kind: "number" },
  berat: { key: "beratKg", kind: "number" },
  panjang_cm: { key: "panjangCm", kind: "number" },
  panjang: { key: "panjangCm", kind: "number" },
  tinggi_cm: { key: "panjangCm", kind: "number" },
  standar: { key: "standar", kind: "string" },
  status_pb_u: { key: "statusPbU", kind: "string" },
  status_pb: { key: "statusPbU", kind: "string" },
  pb_u: { key: "statusPbU", kind: "string" },
  status_bb_u: { key: "statusBbU", kind: "string" },
  status_bb: { key: "statusBbU", kind: "string" },
  bb_u: { key: "statusBbU", kind: "string" },
  status_bb_pb: { key: "statusBbPb", kind: "string" },
  status_bbpb: { key: "statusBbPb", kind: "string" },
  bb_pb: { key: "statusBbPb", kind: "string" },
  status_keseluruhan: { key: "statusKeseluruhan", kind: "string" },
  status: { key: "statusKeseluruhan", kind: "string" },
};

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function emptyMeasurement(): ParsedMeasurement {
  return {
    sessionId: null,
    nama: null,
    tanggalLahir: null,
    umurBulan: null,
    gender: null,
    kategoriTinggi: null,
    tinggiCm: null,
    beratKg: null,
    suhuC: null,
    hrBpm: null,
    spo2Pct: null,
    fsRedirHz: null,
    fsGreenHz: null,
    fsResampleHz: null,
    fsKualitasOk: null,
    durasiKualitasOk: null,
    nSamplePpg: null,
    glukosaMgdl: null,
    glukosaStatus: null,
  };
}

function emptyBabyMeasurement(): ParsedBabyMeasurement {
  return {
    sessionId: null,
    nama: null,
    tanggalLahir: null,
    gender: null,
    usiaBulan: null,
    beratKg: null,
    panjangCm: null,
    standar: null,
    statusPbU: null,
    statusBbU: null,
    statusBbPb: null,
    statusKeseluruhan: null,
  };
}

function parseNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim().replace(/\s/g, "");
  if (!text) return null;
  const normalized = text.includes(",") && !text.includes(".")
    ? text.replace(",", ".")
    : text;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseIntSafe(raw: unknown): number | null {
  const value = parseNumber(raw);
  return value === null ? null : Math.round(value);
}

function parseBoolean(raw: unknown): boolean | null {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim().toLowerCase();
  if (!text) return null;
  if (["true", "1", "ya", "yes", "ok", "valid"].includes(text)) return true;
  if (["false", "0", "tidak", "no", "invalid"].includes(text)) return false;
  return null;
}

function normalizeDate(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const day = String(raw.getDate()).padStart(2, "0");
    const month = String(raw.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${raw.getFullYear()}`;
  }

  const text = String(raw).trim();
  if (!text) return null;

  const match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  return text;
}

function repairMojibake(text: string): string {
  return text
    .replace(/\u00E2\u20AC\u201D/g, "\u2014")
    .replace(/\u00E2\u20AC\u201C/g, "\u2013")
    .replace(/\u00E2\u20AC\u2122/g, "\u2019")
    .replace(/\u00E2\u20AC\u0153/g, "\u201C")
    .replace(/\u00E2\u20AC\u009D/g, "\u201D")
    .replace(/\u00C2\u00A0/g, " ");
}

function parseString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const text = repairMojibake(String(raw)).trim();
  return text ? text : null;
}

function convertValue(raw: unknown, kind: FieldKind): unknown {
  switch (kind) {
    case "number":
      return parseNumber(raw);
    case "int":
      return parseIntSafe(raw);
    case "boolean":
      return parseBoolean(raw);
    case "date":
      return normalizeDate(raw);
    default:
      return parseString(raw);
  }
}

function convertRows(rawRows: Record<string, unknown>[]): ParsedMeasurement[] {
  const rows: ParsedMeasurement[] = [];

  for (const raw of rawRows) {
    const measurement = emptyMeasurement();
    let hasValue = false;

    for (const [rawHeader, value] of Object.entries(raw)) {
      const header = normalizeHeader(rawHeader);
      const rule = FIELD_RULES[header];
      if (!rule) continue;
      const converted = convertValue(value, rule.kind) as never;
      if (converted !== null) {
        measurement[rule.key] = converted;
        hasValue = true;
      }
    }

    if (hasValue) rows.push(measurement);
  }

  return rows;
}

function convertBabyRows(
  rawRows: Record<string, unknown>[],
): ParsedBabyMeasurement[] {
  const rows: ParsedBabyMeasurement[] = [];

  for (const raw of rawRows) {
    const measurement = emptyBabyMeasurement();
    let hasValue = false;

    for (const [rawHeader, value] of Object.entries(raw)) {
      const header = normalizeHeader(rawHeader);
      const rule = BABY_FIELD_RULES[header];
      if (!rule) continue;
      const converted = convertValue(value, rule.kind) as never;
      if (converted !== null) {
        measurement[rule.key] = converted;
        hasValue = true;
      }
    }

    if (hasValue) rows.push(measurement);
  }

  return rows;
}

function isBlankCell(cell: unknown): boolean {
  return (
    cell === null ||
    cell === undefined ||
    (typeof cell === "string" && cell.trim() === "")
  );
}

function csvToRawRows(text: string): Record<string, unknown>[] {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  if (parsed.errors.length > 0) {
    const fatal = parsed.errors.find((error) => error.type === "Delimiter");
    if (fatal) {
      throw new Error(`Gagal membaca CSV: ${fatal.message}`);
    }
  }

  return parsed.data;
}

function excelToRawRows(buffer: Buffer): Record<string, unknown>[] {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch {
    throw new Error(
      "Gagal membaca berkas Excel. Pastikan format .xlsx/.xls valid dan tidak rusak.",
    );
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Berkas Excel tidak memiliki lembar kerja (sheet).");
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  }) as unknown[][];

  if (matrix.length === 0) return [];

  const headerRowIndex = matrix.findIndex((row) =>
    row.some((cell) => !isBlankCell(cell)),
  );
  if (headerRowIndex === -1) return [];

  const headerRow = matrix[headerRowIndex];
  const rawRows: Record<string, unknown>[] = [];

  for (let r = headerRowIndex + 1; r < matrix.length; r += 1) {
    const row = matrix[r];
    if (!row || row.every((cell) => isBlankCell(cell))) continue;

    const record: Record<string, unknown> = {};
    for (let c = 0; c < headerRow.length; c += 1) {
      const header = headerRow[c];
      if (isBlankCell(header)) continue;
      record[String(header)] = row[c] ?? null;
    }
    rawRows.push(record);
  }

  return rawRows;
}

export function parseMeasurementsCsv(text: string): ParsedMeasurement[] {
  return convertRows(csvToRawRows(text));
}

export function parseMeasurementsExcel(buffer: Buffer): ParsedMeasurement[] {
  return convertRows(excelToRawRows(buffer));
}

export function parseBabyMeasurementsCsv(
  text: string,
): ParsedBabyMeasurement[] {
  return convertBabyRows(csvToRawRows(text));
}

export function parseBabyMeasurementsExcel(
  buffer: Buffer,
): ParsedBabyMeasurement[] {
  return convertBabyRows(excelToRawRows(buffer));
}

const EXCEL_EXTENSIONS = ["xlsx", "xlsm", "xlsb", "xls", "ods"];

export const SUPPORTED_UPLOAD_EXTENSIONS = [
  "csv",
  "txt",
  ...EXCEL_EXTENSIONS,
];

export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

export function isSupportedUpload(filename: string): boolean {
  return SUPPORTED_UPLOAD_EXTENSIONS.includes(getFileExtension(filename));
}

export function parseMeasurementsFile(
  buffer: Buffer,
  filename: string,
): ParsedMeasurement[] {
  return EXCEL_EXTENSIONS.includes(getFileExtension(filename))
    ? parseMeasurementsExcel(buffer)
    : parseMeasurementsCsv(buffer.toString("utf8"));
}

export function parseBabyMeasurementsFile(
  buffer: Buffer,
  filename: string,
): ParsedBabyMeasurement[] {
  return EXCEL_EXTENSIONS.includes(getFileExtension(filename))
    ? parseBabyMeasurementsExcel(buffer)
    : parseBabyMeasurementsCsv(buffer.toString("utf8"));
}
