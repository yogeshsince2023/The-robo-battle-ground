import { randomUUID } from "crypto";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/validations";

// Storage abstraction: files are saved to a private Supabase Storage bucket
// and served only through the authenticated /api/admin/files/[id] route.
import { mkdir, writeFile } from "fs/promises";

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

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

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storedName, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);
  } else {
    // Local fallback for development without Supabase configured
    const uploadDir = path.join(process.cwd(), "private-uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, storedName), buffer);
  }

  return {
    originalName: file.name,
    storedName,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

export async function readStoredFile(storedName: string): Promise<Buffer> {
  const safeName = path.basename(storedName); // prevent path traversal
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(safeName);

    if (error) throw new Error(`Storage download failed: ${error.message}`);
    return Buffer.from(await data.arrayBuffer());
  }

  // Local fallback
  const { readFile } = await import("fs/promises");
  return readFile(path.join(process.cwd(), "private-uploads", safeName));
}

export async function deleteStoredFile(storedName: string): Promise<void> {
  const safeName = path.basename(storedName);
  const supabase = getSupabase();
  if (supabase) {
    await supabase.storage.from(BUCKET).remove([safeName]);
  } else {
    const { unlink } = await import("fs/promises");
    await unlink(path.join(process.cwd(), "private-uploads", safeName)).catch(() => {});
  }
}

// Public media upload helper: saves to public Supabase bucket if configured,
// or writes to public directory on local development.
export async function savePublicMedia(file: File, folder: string = "uploads"): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  const storedName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabase();
  const mediaBucket = process.env.SUPABASE_MEDIA_BUCKET || "public-media";

  if (supabase) {
    const { error } = await supabase.storage
      .from(mediaBucket)
      .upload(`${folder}/${storedName}`, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (!error) {
      const { data } = supabase.storage.from(mediaBucket).getPublicUrl(`${folder}/${storedName}`);
      if (data?.publicUrl) return data.publicUrl;
    }
  }

  // Local disk fallback
  const localDir = path.join(process.cwd(), "public", folder);
  await mkdir(localDir, { recursive: true });
  await writeFile(path.join(localDir, storedName), buffer);
  return `/${folder}/${storedName}`;
}
