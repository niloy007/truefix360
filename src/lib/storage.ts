import "server-only";
import { randomUUID } from "crypto";
import {
  ALLOWED_UPLOAD_MIME,
  MAX_PUBLIC_UPLOAD_FILES,
  MAX_UPLOAD_BYTES,
  STORAGE_BUCKETS,
} from "@/config/platform";
import { createAdminClient } from "@/lib/supabase/admin";

const MAGIC: Array<{ mime: string; test: (bytes: Uint8Array) => boolean }> = [
  {
    mime: "image/jpeg",
    test: (bytes) => bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mime: "image/png",
    test: (bytes) =>
      bytes.length > 7 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47,
  },
  {
    mime: "image/webp",
    test: (bytes) => {
      const header = Buffer.from(bytes.slice(0, 12)).toString("ascii");
      return header.startsWith("RIFF") && header.includes("WEBP");
    },
  },
  {
    mime: "application/pdf",
    test: (bytes) => Buffer.from(bytes.slice(0, 4)).toString("ascii") === "%PDF",
  },
];

export type StoredFile = {
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export function validateUploadFile(file: File): string | null {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return "Each file must be 10 MB or smaller.";
  }
  if (!ALLOWED_UPLOAD_MIME.includes(file.type as (typeof ALLOWED_UPLOAD_MIME)[number])) {
    return "Only JPG, PNG, WebP, and PDF files are accepted.";
  }
  return null;
}

export async function assertMagicBytes(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const bytes = new Uint8Array(buffer.subarray(0, 16));
  const match = MAGIC.find((item) => item.test(bytes));
  if (!match) {
    throw new Error("The uploaded file type is not allowed.");
  }
  if (
    file.type &&
    file.type !== match.mime &&
    !(file.type === "image/jpg" && match.mime === "image/jpeg")
  ) {
    throw new Error("The uploaded file type did not match its contents.");
  }
  return match.mime;
}

export function limitFiles(files: File[]): File[] {
  return files.slice(0, MAX_PUBLIC_UPLOAD_FILES);
}

export async function storePrivateFiles(options: {
  bucket: (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
  folder: string;
  files: File[];
}): Promise<StoredFile[]> {
  const admin = createAdminClient();
  const stored: StoredFile[] = [];

  for (const file of limitFiles(options.files)) {
    const sizeError = validateUploadFile(file);
    if (sizeError) throw new Error(sizeError);
    const mimeType = await assertMagicBytes(file);
    const extension = extensionFor(mimeType);
    const storagePath = `${options.folder}/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(options.bucket).upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) {
      throw new Error("The file could not be stored.");
    }
    stored.push({
      storagePath,
      originalName: file.name.slice(0, 180),
      mimeType,
      sizeBytes: file.size,
    });
  }

  return stored;
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

function extensionFor(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "pdf";
}
