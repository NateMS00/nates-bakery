/**
 * The Log sheet's photo slot: whatever the phone's picker hands back (JPEG, PNG,
 * HEIC off an iPhone camera) becomes a JPEG no bigger than `maxEdge` on its long
 * side, under the bake-photos bucket's 5 MB limit (supabase/migrations/0005).
 * `createImageBitmap`'s `imageOrientation: "from-image"` applies the file's own
 * EXIF rotation during decode, so the canvas it's drawn into is already upright —
 * nothing left to correct afterwards. HEIC decodes the same way Safari decodes it
 * for an `<img>` tag; this app's only supported camera source.
 */
export async function resizeToJpeg(file: File, maxEdge: number, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("resizeToJpeg: no 2d context");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("resizeToJpeg: canvas.toBlob failed");
  return blob;
}
