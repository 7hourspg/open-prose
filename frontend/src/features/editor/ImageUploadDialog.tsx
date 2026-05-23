import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dropzone } from "@/components/Dropzone";
import { UploadImage } from "../../../wailsjs/go/api/App";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded: (url: string) => void;
};

export function ImageUploadDialog({ open, onClose, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setError(null);
    }
  }, [open]);

  const handle = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const dataURL = await readAsDataURL(file);
      const url = await UploadImage(dataURL, file.name);
      onUploaded(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add image</DialogTitle>
          <DialogDescription>
            Drop a file here or click to choose. Stored under the current site's
            media folder; copied into <code>public/media/</code> on export.
          </DialogDescription>
        </DialogHeader>
        <Dropzone onAccept={handle} busy={busy} />
        {error && (
          <p className="text-[12px]" style={{ color: "#d44a3e" }}>
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * Imperative helper: mounts the dialog into a temporary portal root,
 * resolves with the uploaded URL on success or null on close/cancel.
 *
 * Lets callers (toolbar buttons, slash-menu items, image fields) open the
 * same dialog without lifting open/close state into every parent.
 */
export function openImageUpload(): Promise<string | null> {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    let resolved = false;
    const finish = (url: string | null) => {
      if (resolved) return;
      resolved = true;
      resolve(url);
      // Re-render with open=false so the dialog plays its exit animation,
      // then tear down once the animation can have completed.
      root.render(<Mount open={false} />);
      setTimeout(() => {
        root.unmount();
        host.remove();
      }, 200);
    };

    function Mount({ open }: { open: boolean }) {
      return (
        <ImageUploadDialog
          open={open}
          onClose={() => finish(null)}
          onUploaded={(url) => finish(url)}
        />
      );
    }

    root.render(<Mount open={true} />);
  });
}
