"use client";

type UploadOptions = {
  folder?: string;
  /** 0–100, dipanggil semasa upload berlangsung */
  onProgress?: (percent: number) => void;
};

/**
 * Upload ke Cloudinary dengan optional progress callback.
 * Kekal backward-compatible: uploadToCloudinary(file, folder?) masih berfungsi.
 */
export async function uploadToCloudinary(
  file: File,
  optsOrFolder?: string | UploadOptions
): Promise<{ url: string; publicId: string }> {
  const opts: UploadOptions =
    typeof optsOrFolder === "string" ? { folder: optsOrFolder } : (optsOrFolder ?? {});

  // 1) Dapatkan signature dari server
  const sigRes = await fetch("/api/admin/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: opts.folder }),
  });
  if (!sigRes.ok) throw new Error("Failed to get Cloudinary signature");
  const { timestamp, signature, apiKey, cloudName, folder: usedFolder } = await sigRes.json();

  // 2) Sediakan form data
  const form = new FormData();
  form.append("file", file);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey);
  form.append("signature", signature);
  form.append("folder", usedFolder);

  // 3) Guna XHR bila perlukan progress; kalau tak, guna fetch biasa
  if (opts.onProgress) {
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();

    const res = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          opts.onProgress?.(pct);
        }
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ url: json.secure_url as string, publicId: json.public_id as string });
          } else {
            reject(new Error(json?.error?.message || "Cloudinary upload failed"));
          }
        } catch {
          reject(new Error("Cloudinary upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.open("POST", endpoint);
      xhr.send(form);
    });

    return res;
  }

  // fallback: fetch (tanpa progress)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Cloudinary upload failed");
  return { url: json.secure_url as string, publicId: json.public_id as string };
}
