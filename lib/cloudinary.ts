export type CloudinaryUploadResponse = {
  secure_url?: string;
  url?: string;
  public_id?: string;
  error?: string | { message?: string } | { message?: string }[];
  done?: boolean;
  status?: string;
};

export async function uploadToCloudinary(
  file: File,
  folder?: string,
  cloudNameOverride?: string | null,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal | null,
) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "portfolio_uploads";
  const cloudName = cloudNameOverride ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment or provide cloudNameOverride.");
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME) {
    // eslint-disable-next-line no-console
    console.warn("Using CLOUDINARY_CLOUD_NAME (no NEXT_PUBLIC_ prefix) — consider adding NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME for client uploads in production.");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
  const uniqueUploadId = crypto.randomUUID();
  const CHUNK_SIZE = 10 * 1024 * 1024;
  const CHUNKED_THRESHOLD = 95 * 1024 * 1024;

  async function uploadChunk(start: number, end: number, attempt = 0): Promise<CloudinaryUploadResponse> {
    const slice = file.slice(start, end + 1, file.type || "application/octet-stream");
    const chunkFile = new File([slice], file.name, { type: file.type || "application/octet-stream" });
    const formData = new FormData();
    formData.append("file", chunkFile, file.name);
    formData.append("upload_preset", preset);
    if (folder) {
      formData.append("folder", folder);
    }

    const headers = {
      "X-Unique-Upload-Id": uniqueUploadId,
      "Content-Range": `bytes ${start}-${end}/${file.size}`,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers,
        signal: abortSignal ?? undefined,
      });

      let data: CloudinaryUploadResponse;
      try {
        data = (await response.json()) as CloudinaryUploadResponse;
      } catch (err) {
        throw new Error(`Cloudinary response parse error: ${String(err)}`);
      }

      if (response.status >= 500 && attempt < 2) {
        return uploadChunk(start, end, attempt + 1);
      }

      if (!response.ok) {
        const errorMessage = typeof data.error === "string" ? data.error : (data.error && "message" in data.error ? data.error.message : undefined) ?? `Cloudinary upload failed (status ${response.status})`;
        throw new Error(`${errorMessage} (status ${response.status})`);
      }

      if (typeof data.error === "string" && data.error) {
        throw new Error(data.error);
      }

      if (data.done === false) {
        return data;
      }

      if (!data.secure_url) {
        const finalError = typeof data.error === "string" ? data.error : (data.error && "message" in data.error ? data.error.message : undefined) ?? "Cloudinary upload did not return a secure URL.";
        throw new Error(finalError);
      }

      return data;
    } catch (error) {
      if (abortSignal?.aborted) {
        throw new Error("Video upload cancelled.");
      }

      const isNetworkError = error instanceof TypeError || (error instanceof Error && error.name === "AbortError");
      const isRetryableServerError = error instanceof Error && /status\s+[5-9]\d\d|Cloudinary upload failed \(status 5/i.test(error.message);

      if ((isNetworkError || isRetryableServerError) && attempt < 2) {
        return uploadChunk(start, end, attempt + 1);
      }

      throw error;
    }
  }

  if (file.size < CHUNKED_THRESHOLD) {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("upload_preset", preset);
    if (folder) {
      formData.append("folder", folder);
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: abortSignal ?? undefined,
    });

    let data: CloudinaryUploadResponse;
    try {
      data = (await response.json()) as CloudinaryUploadResponse;
    } catch (err) {
      throw new Error(`Cloudinary response parse error: ${String(err)}`);
    }

    if (!response.ok || !data.secure_url) {
      const errorMessage = typeof data.error === "string" ? data.error : (data.error && "message" in data.error ? data.error.message : undefined) ?? `Cloudinary upload failed (status ${response.status})`;
      throw new Error(`${errorMessage} (status ${response.status})`);
    }

    onProgress?.(100);
    return data.secure_url;
  }

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedBytes = 0;

  for (let index = 0; index < totalChunks; index += 1) {
    if (abortSignal?.aborted) {
      throw new Error("Video upload cancelled.");
    }

    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE - 1, file.size - 1);
    const data = await uploadChunk(start, end, 0);
    if (data.done === false) {
      uploadedBytes = Math.min(end + 1, file.size);
      onProgress?.(Math.max(0, Math.min(100, (uploadedBytes / file.size) * 100)));
      continue;
    }

    uploadedBytes = Math.min(end + 1, file.size);
    onProgress?.(Math.max(0, Math.min(100, (uploadedBytes / file.size) * 100)));

    if (data.secure_url) {
      return data.secure_url;
    }
  }

  throw new Error("Cloudinary upload did not return a secure URL after the final chunk.");
}

export function getCloudinaryUrl(path: string) {
  return path.startsWith("http") ? path : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${path}`;
}

/**
 * Return a Cloudinary delivery URL that applies background removal on-the-fly.
 * If the input URL is not a res.cloudinary.com URL, returns null.
 * Avoids inserting the transformation twice if already present.
 */
export function getCloudinaryBackgroundRemovedUrl(url: string): string | null {
  try {
    if (!url || typeof url !== "string") return null;
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.endsWith("res.cloudinary.com") && !hostname.includes("cloudinary.com")) return null;

    // Cloudinary delivery URLs typically contain /image/upload/ followed by transformations and the asset path
    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.findIndex((s) => s === "upload");
    if (uploadIndex === -1) return null;

    // Check if background removal has already been applied
    const transformations = segments.slice(uploadIndex + 1, uploadIndex + 6).join("/");
    if (transformations.includes("e_background_removal")) return url;

    // Insert the transformation immediately after 'upload'
    const before = segments.slice(0, uploadIndex + 1).join("/");
    const after = segments.slice(uploadIndex + 1).join("/");

    const newPath = `/${before}/e_background_removal/f_png/${after}`;
    return `${parsed.protocol}//${parsed.host}${newPath}${parsed.search}`;
  } catch (err) {
    return null;
  }
}
