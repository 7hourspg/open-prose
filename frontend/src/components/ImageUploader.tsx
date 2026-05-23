import { useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { useResolvedSrc } from "@/hooks/use-resolved-src";
import { uploadImageFile } from "@/features/editor/upload";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Empty-state heading inside the dropzone. */
  title?: string;
  /** Empty-state hint inside the dropzone. */
  hint?: string;
  /** Max file size in MB (default 8). */
  maxSizeMB?: number;
};

/**
 * Site-icon / OG-image uploader. Empty state IS a Dropzone (drag-drop + click);
 * filled state shows a thumbnail with Replace / Remove. Both go through the
 * same upload pipeline as the editor's image button.
 */
export function ImageUploader({
  value,
  onChange,
  title = "Drop an image here",
  hint,
  maxSizeMB = 8,
}: Props) {
  const [busy, setBusy] = useState(false);
  const resolved = useResolvedSrc(value);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: "var(--canvas)",
          border: "0.5px solid var(--hairline-strong)",
        }}
      >
        <div
          className="flex items-center justify-center p-4"
          style={{ minHeight: 160 }}
        >
          <img
            src={resolved || value}
            alt=""
            className="max-h-[140px] max-w-full rounded object-contain"
            draggable={false}
          />
        </div>
        <div
          className="flex items-center justify-end gap-3 px-3 py-2"
          style={{ borderTop: "0.5px solid var(--hairline)" }}
        >
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11.5px] hover:underline"
            style={{ color: "var(--ink-4)" }}
          >
            Remove
          </button>
          <ReplaceButton onPicked={handleFile} busy={busy} />
        </div>
      </div>
    );
  }

  return (
    <Dropzone
      onAccept={handleFile}
      title={title}
      hint={hint}
      busy={busy}
      maxSizeMB={maxSizeMB}
    />
  );
}

function ReplaceButton({
  onPicked,
  busy,
}: {
  onPicked: (file: File) => void;
  busy: boolean;
}) {
  return (
    <label
      className={
        "cursor-pointer text-[12px] font-medium" +
        (busy ? " pointer-events-none opacity-50" : "")
      }
      style={{ color: "var(--accent)" }}
    >
      {busy ? "Uploading…" : "Replace"}
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPicked(f);
          // reset so picking the same file again still fires onChange
          e.target.value = "";
        }}
      />
    </label>
  );
}
