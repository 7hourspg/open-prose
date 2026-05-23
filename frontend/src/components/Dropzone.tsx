import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

const DEFAULT_ACCEPT =
  "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif";

type Props = {
  onAccept: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  /** Override the default copy. */
  hint?: string;
  /** Override the default heading. */
  title?: string;
  busy?: boolean;
};

/**
 * A controlled image dropzone: drag-and-drop or click-to-pick. Calls
 * onAccept(file) when a single valid file is added; the parent decides
 * what to do with it (upload, preview, etc.).
 *
 * Adapted from coss.com/origin/comp-545 + use-file-upload hook.
 */
export function Dropzone({
  onAccept,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 8,
  title = "Drop your image here",
  hint,
  busy,
}: Props) {
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept,
    maxSize,
    onFilesAdded: (added) => {
      const f = added[0]?.file;
      if (f instanceof File) onAccept(f);
    },
  });

  const previewUrl = files[0]?.preview || null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div
          className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
          data-dragging={isDragging || undefined}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            borderColor: isDragging ? "var(--accent)" : "var(--hairline-strong)",
            background: isDragging
              ? "color-mix(in oklab, var(--accent) 8%, transparent)"
              : "var(--canvas)",
          }}
        >
          <input
            {...getInputProps()}
            aria-label="Upload image file"
            className="sr-only"
          />
          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                alt=""
                className="mx-auto max-h-full rounded object-contain"
                src={previewUrl}
              />
              {busy && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-[12px] font-medium"
                  style={{
                    background: "color-mix(in oklab, var(--canvas) 85%, transparent)",
                    color: "var(--ink-2)",
                  }}
                >
                  Uploading…
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                aria-hidden="true"
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                style={{
                  borderColor: "var(--hairline-strong)",
                  background: "var(--panel)",
                  color: "var(--ink-3)",
                }}
              >
                <ImageIcon className="size-4 opacity-70" />
              </div>
              <p
                className="mb-1.5 text-[13.5px] font-medium"
                style={{ color: "var(--ink) " }}
              >
                {title}
              </p>
              <p
                className="text-[11.5px]"
                style={{ color: "var(--ink-3)" }}
              >
                {hint ?? `SVG, PNG, JPG, GIF, WEBP, AVIF — max ${maxSizeMB}MB`}
              </p>
              <Button
                className="mt-4"
                onClick={openFileDialog}
                variant="outline"
                disabled={busy}
              >
                <UploadIcon
                  aria-hidden="true"
                  className="-ms-1 size-4 opacity-70"
                />
                {busy ? "Uploading…" : "Select image"}
              </Button>
            </div>
          )}
        </div>

        {previewUrl && !busy && (
          <div className="absolute right-3 top-3">
            <button
              aria-label="Remove image"
              className="z-50 flex size-7 cursor-pointer items-center justify-center rounded-full text-white outline-none transition-colors"
              onClick={() => removeFile(files[0]?.id)}
              type="button"
              style={{ background: "rgba(0,0,0,.65)" }}
            >
              <XIcon aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1.5 text-[12px]"
          role="alert"
          style={{ color: "#d44a3e" }}
        >
          <AlertCircleIcon className="size-3.5 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
