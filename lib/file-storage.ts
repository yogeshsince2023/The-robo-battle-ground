import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/validations";

// Storage abstraction: files are saved to a private, non-web-accessible directory
// (UPLOAD_DIR, default: <project>/private-uploads) and served only through the
// authenticated /api/admin/files/[id] route — never via a predictable public URL.
// Swap this module for an S3/GCS-backed implementation later without touching callers.

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "private-uploads");

export function isAllowedFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ALLOWED_UPLOAD_EXTENSIONS.includes(ext);
}

export function isAllowedSize(size: number): boolean {
  return size > 0 && size <= MAX_UPLOAD_SIZE_BYTES;
}

export async function saveUploadedFile(file: File) {
  await mkdir(UPLOAD_ROOT, { recursive: true });

  const ext = path.extname(file.name).toLowerCase();
  const storedName = `${randomUUID()}${ext}`;
  const destPath = path.join(UPLOAD_ROOT, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destPath, buffer);

  return {
    originalName: file.name,
    storedName,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

export async function readStoredFile(storedName: string) {
  const safeName = path.basename(storedName); // prevent path traversal
  const filePath = path.join(UPLOAD_ROOT, safeName);
  return readFile(filePath);
}

export async function deleteStoredFile(storedName: string) {
  const safeName = path.basename(storedName);
  const filePath = path.join(UPLOAD_ROOT, safeName);
  try {
    await unlink(filePath);
  } catch {
    // already gone — ignore
  }
}
