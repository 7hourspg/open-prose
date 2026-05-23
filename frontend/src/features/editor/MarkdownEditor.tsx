import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { MarkdownPlugin } from "@platejs/markdown";
import { KEYS } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FormatBar } from "@/features/editor/FormatBar";
import { uploadImageFile } from "@/features/editor/upload";
import { looksLikeCode } from "@/features/editor/paste-detect";

type Props = {
  initialMarkdown: string;
  onChangeMarkdown: (md: string) => void;
  placeholder?: string;
  header?: ReactNode;
  footer?: ReactNode;
};

export function MarkdownEditor({
  initialMarkdown,
  onChangeMarkdown,
  placeholder,
  header,
  footer,
}: Props) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: (e) =>
      e.getApi(MarkdownPlugin).markdown.deserialize(initialMarkdown ?? ""),
  });

  // Visual highlight when the user drags a file over the canvas.
  const [dropping, setDropping] = useState(false);

  // Plate fires onChange once on mount with the freshly-deserialized doc; that
  // round-trip isn't byte-identical to initialMarkdown, so without this guard
  // every "open" would trigger a save and bump updated_at.
  const baselineMdRef = useRef<string | null>(null);

  const insertImageAt = (url: string, at: unknown | undefined) => {
    (editor as any).tf.insertNodes(
      {
        type: editor.getType(KEYS.img),
        url,
        children: [{ text: "" }],
      },
      at !== undefined ? { at } : undefined
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!hasImageFile(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dropping) setDropping(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving to outside the wrapper, not a child element.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDropping(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    setDropping(false);
    if (!hasImageFile(e.dataTransfer)) return;
    const file = pickFirstImage(e.dataTransfer.files);
    if (!file) return;
    e.preventDefault();

    // Compute the slate range under the drop point so the image lands
    // exactly where the user dropped it.
    const at = findRangeAtEvent(editor, e.nativeEvent);
    const url = await uploadImageFile(file);
    insertImageAt(url, at ?? (editor as any).selection);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Image first.
    const file = pickFirstImageFromItems(e.clipboardData.items);
    if (file) {
      e.preventDefault();
      const url = await uploadImageFile(file);
      insertImageAt(url, undefined);
      return;
    }

    // If selection is already inside a code-block, let the default paste run
    // (Plate's code-block plugin handles plain-text paste correctly there).
    const ed = editor as any;
    const inCodeBlock = !!ed.api?.some?.({
      match: { type: ed.getType(KEYS.codeBlock) },
    });
    if (inCodeBlock) return;

    // Detect a multi-line plain-text paste that looks like code; wrap it in a
    // code-block so newlines and formatting survive.
    const text = e.clipboardData.getData("text/plain");
    if (!text || !looksLikeCode(text)) return;
    e.preventDefault();
    const lines = text.replace(/\r\n?/g, "\n").split("\n");
    ed.tf.insertNodes({
      type: ed.getType(KEYS.codeBlock),
      lang: "auto",
      children: lines.map((line) => ({
        type: ed.getType(KEYS.codeLine),
        children: [{ text: line }],
      })),
    });
  };

  return (
    <Plate
      editor={editor}
      onChange={({ editor: e }) => {
        const md = e.getApi(MarkdownPlugin).markdown.serialize();
        if (baselineMdRef.current === null) {
          baselineMdRef.current = md;
          return;
        }
        if (md === baselineMdRef.current) return;
        baselineMdRef.current = md;
        onChangeMarkdown(md);
      }}
    >
      <FormatBar />
      <div
        className="relative flex min-h-0 flex-1 flex-col"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <EditorContainer
          variant="default"
          className="thin-scrollbar"
          style={{ background: "var(--canvas)" }}
        >
          <div className="mx-auto w-full max-w-[720px] min-w-0 px-8 pt-10 pb-[200px]">
            {header}
            <Editor
              variant="none"
              placeholder={placeholder ?? "Start writing…"}
              className="prose-doc"
              onPaste={handlePaste}
              style={{
                fontFamily: "var(--font-serif-stack)",
                fontSize: "clamp(15px, 1.6vw, 17.5px)",
                lineHeight: 1.65,
                color: "var(--ink)",
                overflowX: "clip",
              }}
            />
            {footer}
            <div
              className="h-[140px] cursor-text"
              onClick={() => focusEditorEnd(editor)}
            />
          </div>
        </EditorContainer>
        {dropping && (
          <div
            className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-lg border-2 border-dashed text-[13px] font-medium"
            style={{
              borderColor: "var(--accent)",
              background: "color-mix(in oklab, var(--accent) 8%, transparent)",
              color: "var(--accent)",
            }}
          >
            Drop image to insert
          </div>
        )}
      </div>
    </Plate>
  );
}

function hasImageFile(dt: DataTransfer): boolean {
  if (!dt) return false;
  if (dt.files && dt.files.length > 0) {
    for (const f of Array.from(dt.files)) {
      if (f.type.startsWith("image/")) return true;
    }
  }
  if (dt.items && dt.items.length > 0) {
    for (const it of Array.from(dt.items)) {
      if (it.kind === "file" && it.type.startsWith("image/")) return true;
    }
  }
  return false;
}

function pickFirstImage(files: FileList): File | null {
  for (const f of Array.from(files)) {
    if (f.type.startsWith("image/")) return f;
  }
  return null;
}

function pickFirstImageFromItems(
  items: DataTransferItemList | null
): File | null {
  if (!items) return null;
  for (const it of Array.from(items)) {
    if (it.kind === "file" && it.type.startsWith("image/")) {
      const f = it.getAsFile();
      if (f) return f;
    }
  }
  return null;
}

/**
 * Try the various places Plate/Slate expose a "find slate range from a DOM
 * event" helper. Returns undefined if none works (caller falls back to the
 * current selection).
 */
function findRangeAtEvent(editor: unknown, event: Event): unknown | undefined {
  const e = editor as { api?: { findEventRange?: (ev: Event) => unknown } };
  try {
    if (typeof e.api?.findEventRange === "function") {
      return e.api.findEventRange(event);
    }
  } catch {
    /* fall through */
  }
  return undefined;
}

/**
 * Place the cursor at the very end of the document and focus the editor.
 * Used by the click-target below the editor so a click in the empty space
 * after the last block (often an unescapable code block) lands the caret in
 * the trailing paragraph.
 */
function focusEditorEnd(editor: unknown) {
  const e = editor as {
    tf?: { focus?: () => void; select?: (at: unknown, opts?: unknown) => void };
    api?: { end?: (at?: unknown) => unknown };
  };
  try {
    const end = e.api?.end?.([]);
    if (end && e.tf?.select) {
      e.tf.select(end, { focus: true } as unknown as never);
    } else {
      e.tf?.focus?.();
    }
  } catch {
    /* swallow */
  }
}
