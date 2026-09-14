import { randomUUID } from "crypto";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/validations";

// Storage abstraction: files are saved to a private Supabase Storage bucket
// and served only through the authenticated /api/admin/files/[id] route.
// The bucket must be set to Private in the Supabase dashboard.

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "machining-uploads";

export function isAllowedFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ALLOWED_UPLOAD_EXTENSIONS.includes(ext);
}

export function isAllowedSize(size: number): boolean {
  return size > 0 && size <= MAX_UPLOAD_SIZE_BYTES;
}

export async function saveUploadedFile(file: File) {
  const ext = path.extname(file.name).toLowerCase();
  const storedName = `${randomUUID()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storedName, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return {
    originalName: file.name,
    storedName,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

export async function readStoredFile(storedName: string): Promise<Buffer> {
  const safeName = path.basename(storedName); // prevent path traversal
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(safeName);

  if (error) throw new Error(`Storage download failed: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function deleteStoredFile(storedName: string): Promise<void> {
  const safeName = path.basename(storedName);
  // ignore errors — file may already be gone
  await supabase.storage.from(BUCKET).remove([safeName]);
}
