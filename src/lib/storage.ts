import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const PROJECT_ROOT = process.cwd();
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(PROJECT_ROOT, "data", "uploads");

export interface SavedFile {
  filePath: string;
  filename: string;
}

function sanitizeFilename(name: string): string {
  const base = path.basename(name);
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || "upload.csv";
}

export async function saveUploadFile(
  buffer: Buffer,
  originalName: string,
): Promise<SavedFile> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const safeName = sanitizeFilename(originalName);
  const unique = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const filename = `${unique}_${safeName}`;
  const absolutePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(absolutePath, buffer);

  const relativePath = path.relative(PROJECT_ROOT, absolutePath) || absolutePath;
  return { filePath: relativePath, filename };
}

export function resolveUploadPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(PROJECT_ROOT, filePath);
}

export async function deleteUploadFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(resolveUploadPath(filePath));
  } catch {
    // File mungkin sudah tidak ada; abaikan.
  }
}
