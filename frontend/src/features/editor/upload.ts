import { UploadImage } from "../../../wailsjs/go/api/App";
import { openImageUpload } from "@/features/editor/ImageUploadDialog";

/**
 * Open the shared image upload dialog (drag-and-drop or click-to-pick).
 * Returns the uploaded URL ("/media/<filename>") or null on cancel.
 */
export function pickAndUploadImage(): Promise<string | null> {
  return openImageUpload();
}

/**
 * Upload an already-resolved File without prompting the user. Used by the
 * editor's drop/paste handlers — the user has already chosen the file by
 * dragging it onto the canvas.
 */
export async function uploadImageFile(file: File): Promise<string> {
  const dataURL = await readAsDataURL(file);
  return UploadImage(dataURL, file.name);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}
