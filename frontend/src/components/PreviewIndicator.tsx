import { Icon } from "@/components/Icon";
import { stopPreview, usePreview } from "@/lib/preview";
import { OpenURL } from "../../wailsjs/go/api/App";

export function PreviewIndicator() {
  const preview = usePreview();
  const running = !!preview.data?.running;
  if (!running || !preview.data) return null;
  const url = preview.data.url;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: "color-mix(in oklab, #2bbb6e 18%, transparent)",
        color: "#1a8a4f",
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: "#2bbb6e" }}
      />
      <span style={{ fontFamily: "var(--font-mono-stack)" }}>
        {url.replace(/^https?:\/\//, "")}
      </span>
      <button
        type="button"
        title="Open in browser"
        onClick={() => OpenURL(url)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm border-0 bg-transparent"
        style={{ color: "#1a8a4f" }}
      >
        <Icon name="rocket" size={9} />
      </button>
      <button
        type="button"
        title="Stop preview"
        onClick={() => stopPreview()}
        className="inline-flex h-4 w-4 items-center justify-center rounded-sm border-0 bg-transparent"
        style={{ color: "#1a8a4f" }}
      >
        <Icon name="x" size={9} />
      </button>
    </span>
  );
}
