export const DEVICE_TYPES = ["VITAL_SIGN", "BABY_SCALE"] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const DEVICE_LABELS: Record<DeviceType, string> = {
  VITAL_SIGN: "Alat Vital Sign",
  BABY_SCALE: "Timbangan Bayi",
};

export const DEVICE_SHORT_LABELS: Record<DeviceType, string> = {
  VITAL_SIGN: "Vital Sign",
  BABY_SCALE: "Timbangan Bayi",
};

const BABY_SCALE_ALIASES = [
  "baby_scale",
  "baby",
  "timbangan",
  "timbangan_bayi",
  "timbanganbayi",
  "scale",
  "anthropometry",
  "antropometri",
];

export function isDeviceType(value: unknown): value is DeviceType {
  return (
    typeof value === "string" &&
    (DEVICE_TYPES as readonly string[]).includes(value)
  );
}

export function normalizeDeviceType(value: unknown): DeviceType {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return BABY_SCALE_ALIASES.includes(text) ? "BABY_SCALE" : "VITAL_SIGN";
}

export function deviceLabel(value: unknown): string {
  return DEVICE_LABELS[normalizeDeviceType(value)];
}
