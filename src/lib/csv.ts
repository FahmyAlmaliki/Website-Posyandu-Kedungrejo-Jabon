import Papa from "papaparse";

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

type FieldKind = "string" | "number" | "int" | "boolean" | "date";

interface FieldRule {
  key: keyof ParsedMeasurement;
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
  const text = String(raw).trim();
  if (!text) return null;

  const match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  return text;
}

function parseString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
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

export function parseMeasurementsCsv(text: string): ParsedMeasurement[] {
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

  const rows: ParsedMeasurement[] = [];

  for (const raw of parsed.data) {
    const measurement = emptyMeasurement();
    let hasValue = false;

    for (const [header, value] of Object.entries(raw)) {
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
